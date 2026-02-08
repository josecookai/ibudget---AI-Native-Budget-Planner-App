import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { isAuthEnabled } from "@/lib/auth-enabled";
import { authOptions } from "@/lib/auth-options";
import { appendTransaction } from "@/lib/google-sheets";
import { CATEGORY_VALUES, USER_VALUES } from "@/lib/transaction-types";

const saveSchema = z.object({
  amount: z.number().nonnegative(),
  category: z.enum(CATEGORY_VALUES),
  merchant: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  user: z.enum(USER_VALUES),
  notes: z.string().max(280).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const authRequired = isAuthEnabled();
    if (authRequired && !session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = saveSchema.parse(await request.json());

    await appendTransaction({
      amount: payload.amount,
      category: payload.category,
      merchant: payload.merchant,
      date: payload.date,
      user: payload.user,
      notes: payload.notes,
      // @ts-expect-error augmented by authOptions callbacks
      userId: session?.user?.id ?? "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid transaction payload.",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown save error";
    return NextResponse.json(
      { error: "Failed to save transaction.", details: message },
      { status: 500 }
    );
  }
}
