import "server-only";

import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import {
  CATEGORY_VALUES,
  type TransactionCategory,
  type TransactionInput,
  type TransactionRecord,
  type TransactionUser,
} from "@/lib/transaction-types";
import { getOrCreateWorksheet } from "@/lib/sheets-client";

const SHEET_COLUMNS = [
  "Date",
  "Amount",
  "Category",
  "Merchant",
  "User",
  "Notes",
  "UserId",
  "CreatedAt",
] as const;

let worksheetPromise: Promise<GoogleSpreadsheetWorksheet> | null = null;

function toISODate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDateValue(raw: unknown): string | null {
  if (!raw) {
    return null;
  }

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return toISODate(raw);
  }

  const text = String(raw).trim();
  if (!text) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return toISODate(parsed);
}

function parseAmountValue(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const sanitized = raw.replace(/[^0-9.-]/g, "").trim();
    if (!sanitized) {
      return null;
    }
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeCategory(value: unknown): TransactionCategory {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) {
    return "Other";
  }
  if (raw.includes("food") || raw.includes("grocery") || raw.includes("restaurant")) {
    return "Food";
  }
  if (raw.includes("transport") || raw.includes("taxi") || raw.includes("uber") || raw.includes("bus")) {
    return "Transport";
  }
  if (raw.includes("kid") || raw.includes("school") || raw.includes("baby")) {
    return "Kids";
  }
  if (raw.includes("house") || raw.includes("home") || raw.includes("utility") || raw.includes("rent")) {
    return "House";
  }
  return "Other";
}

function normalizeUser(value: unknown): TransactionUser {
  const raw = String(value ?? "").trim().toLowerCase();
  return raw === "helper" ? "Helper" : "Mom";
}

function normalizeMerchant(value: unknown): string {
  const merchant = String(value ?? "").trim();
  return merchant || "Unknown";
}

function normalizeNotes(value: unknown): string {
  return String(value ?? "").trim();
}

async function getWorksheet(): Promise<GoogleSpreadsheetWorksheet> {
  if (!worksheetPromise) {
    const title = (process.env.GOOGLE_SHEET_TAB_NAME || "").trim();
    if (!title) {
      throw new Error("Missing required env var: GOOGLE_SHEET_TAB_NAME");
    }
    worksheetPromise = getOrCreateWorksheet({
      title,
      requiredHeaders: [...SHEET_COLUMNS],
    }).catch((error) => {
      worksheetPromise = null;
      throw error;
    });
  }

  return worksheetPromise;
}

function normalizeRow(row: Record<string, unknown>): TransactionRecord | null {
  const date = parseDateValue(row.Date);
  const amount = parseAmountValue(row.Amount);

  if (!date || amount === null) {
    return null;
  }

  return {
    date,
    amount,
    category: normalizeCategory(row.Category),
    merchant: normalizeMerchant(row.Merchant),
    user: normalizeUser(row.User),
    notes: normalizeNotes(row.Notes),
  };
}

export async function appendTransaction(
  input: TransactionInput & { userId?: string; createdAt?: string }
): Promise<void> {
  const worksheet = await getWorksheet();

  await worksheet.addRow({
    Date: input.date,
    Amount: Number(input.amount.toFixed(2)),
    Category: input.category,
    Merchant: input.merchant.trim(),
    User: input.user,
    Notes: input.notes?.trim() ?? "",
    UserId: input.userId ?? "",
    CreatedAt: input.createdAt ?? new Date().toISOString(),
  });
}

export async function getRecentTransactions(limit = 5): Promise<TransactionRecord[]> {
  const worksheet = await getWorksheet();
  const rows = await worksheet.getRows<Record<string, unknown>>();

  return rows
    .map((row) => normalizeRow(row.toObject()))
    .filter((row): row is TransactionRecord => row !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export async function getMonthlyTransactions(referenceDate = new Date()): Promise<TransactionRecord[]> {
  const worksheet = await getWorksheet();
  const rows = await worksheet.getRows<Record<string, unknown>>();

  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);

  return rows
    .map((row) => normalizeRow(row.toObject()))
    .filter((row): row is TransactionRecord => row !== null)
    .filter((row) => {
      const date = new Date(`${row.date}T00:00:00`);
      return date >= start && date < end;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getMonthlyTotal(referenceDate = new Date()): Promise<number> {
  const monthly = await getMonthlyTransactions(referenceDate);
  const total = monthly.reduce((sum, row) => sum + row.amount, 0);

  return Number(total.toFixed(2));
}
