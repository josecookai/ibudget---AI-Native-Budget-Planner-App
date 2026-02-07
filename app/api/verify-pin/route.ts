import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

const verifyPinSchema = z.object({
  pin: z.string().min(1).max(32),
});

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(request: Request) {
  try {
    const payload = verifyPinSchema.parse(await request.json());
    const expectedPin = process.env.APP_PIN;

    if (!expectedPin) {
      return NextResponse.json(
        { error: "APP_PIN is not configured." },
        { status: 500 }
      );
    }

    if (!safeCompare(payload.pin, expectedPin)) {
      return NextResponse.json({ error: "Invalid PIN." }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
