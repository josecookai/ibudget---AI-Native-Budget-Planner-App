import { NextResponse } from "next/server";
import OpenAI from "openai";
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

const SYSTEM_PROMPT =
  "Extract data from this image. JSON format: {amount (number), category (Food/Transport/Kids/House/Other), merchant (string), date (YYYY-MM-DD)}. If uncertain, guess based on context.";

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "bill_extraction",
          strict: true,
          schema: {
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
      },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract expense details from this receipt image.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${body.mimeType};base64,${body.imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "No OCR output returned from AI model." },
        { status: 502 }
      );
    }

    const parsed = modelResponseSchema.parse(JSON.parse(rawContent));
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

    const message = error instanceof Error ? error.message : "Unknown OCR error";
    return NextResponse.json(
      { error: "Failed to process bill image.", details: message },
      { status: 502 }
    );
  }
}
