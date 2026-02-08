import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { CATEGORY_VALUES, type TransactionCategory } from "@/lib/transaction-types";

const requestSchema = z.object({
  imageBase64: z.string().min(20),
  mimeType: z.string().regex(/^image\/[a-zA-Z0-9.+-]+$/),
});

const modelResponseSchema = z.object({
  amount: z.union([z.number(), z.string()]),
  category: z.string(),
  merchant: z.string(),
  date: z.string(),
});

function normalizeCategory(raw: string): TransactionCategory {
  const value = raw.trim().toLowerCase();

  if (value.includes("food") || value.includes("grocery") || value.includes("restaurant")) {
    return "Food";
  }
  if (value.includes("transport") || value.includes("taxi") || value.includes("uber") || value.includes("bus")) {
    return "Transport";
  }
  if (value.includes("kid") || value.includes("school") || value.includes("baby")) {
    return "Kids";
  }
  if (value.includes("house") || value.includes("home") || value.includes("utility") || value.includes("rent")) {
    return "House";
  }

  const exactMatch = CATEGORY_VALUES.find(
    (category) => category.toLowerCase() === value
  );
  return exactMatch ?? "Other";
}

function normalizeAmount(raw: string | number): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Number(raw.toFixed(2));
  }

  const parsed = Number(String(raw).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Number(parsed.toFixed(2));
}

function normalizeDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function normalizeMerchant(raw: string): string {
  const merchant = raw.trim();
  return merchant || "Unknown";
}

function parseModelJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Gemini response is not valid JSON.");
  }
}

const SYSTEM_PROMPT =
  "Extract data from this image. JSON format: {amount (number), category (Food/Transport/Kids/House/Other), merchant (string), date (YYYY-MM-DD)}. If uncertain, guess based on context.";

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

    const completion = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Extract expense details from this receipt image.",
            },
            {
              inlineData: {
                mimeType: body.mimeType,
                data: body.imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0,
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            amount: { type: "number" },
            category: {
              type: "string",
              enum: [...CATEGORY_VALUES],
            },
            merchant: { type: "string" },
            date: {
              type: "string",
              pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            },
          },
          required: ["amount", "category", "merchant", "date"],
        },
      },
    });

    const rawContent = completion.text?.trim();
    if (!rawContent) {
      return NextResponse.json(
        { error: "No OCR output returned from Gemini." },
        { status: 502 }
      );
    }

    const parsed = modelResponseSchema.parse(parseModelJson(rawContent));
    const data = {
      amount: normalizeAmount(parsed.amount),
      category: normalizeCategory(parsed.category),
      merchant: normalizeMerchant(parsed.merchant),
      date: normalizeDate(parsed.date),
    };

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body.", details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("quota")) {
        return NextResponse.json(
          { error: "Gemini quota exceeded.", details: error.message },
          { status: 429 }
        );
      }

      if (error.message.toLowerCase().includes("api key")) {
        return NextResponse.json(
          { error: "Invalid Gemini API key.", details: error.message },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: "Failed to process bill image.", details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process bill image.", details: "Unknown OCR error" },
      { status: 502 }
    );
  }
}
