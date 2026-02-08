import "server-only";

import { GoogleAuth } from "google-auth-library";
import {
  GoogleSpreadsheet,
  type GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";

import {
  CATEGORY_VALUES,
  type TransactionCategory,
  type TransactionInput,
  type TransactionRecord,
  type TransactionUser,
} from "@/lib/transaction-types";

const SHEET_COLUMNS = [
  "Date",
  "Amount",
  "Category",
  "Merchant",
  "User",
  "Notes",
] as const;

let worksheetPromise: Promise<GoogleSpreadsheetWorksheet> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

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

async function createWorksheet(): Promise<GoogleSpreadsheetWorksheet> {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const tabName = requireEnv("GOOGLE_SHEET_TAB_NAME");
  const clientEmail = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await doc.loadInfo();

  const worksheet = doc.sheetsByTitle[tabName];
  if (!worksheet) {
    throw new Error(`Worksheet \"${tabName}\" not found in spreadsheet ${spreadsheetId}`);
  }

  // Header values must be loaded before calling `addRow/getRows`.
  // If the sheet is blank, `loadHeaderRow()` throws and `headerValues` getter also throws.
  let existingHeaders: string[] = [];
  try {
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  } catch {
    await worksheet.setHeaderRow([...SHEET_COLUMNS]);
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  }

  if (existingHeaders.length === 0) {
    // Defensive: if the API didn't return headers, force-set them again.
    await worksheet.setHeaderRow([...SHEET_COLUMNS]);
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  }

  const missing = SHEET_COLUMNS.filter((header) => !existingHeaders.includes(header));
  if (missing.length > 0) {
    throw new Error(
      `Worksheet is missing required columns: ${missing.join(", ")}. Expected columns: ${SHEET_COLUMNS.join(", ")}`
    );
  }

  return worksheet;
}

async function getWorksheet(): Promise<GoogleSpreadsheetWorksheet> {
  if (!worksheetPromise) {
    worksheetPromise = createWorksheet().catch((error) => {
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

export async function appendTransaction(input: TransactionInput): Promise<void> {
  const worksheet = await getWorksheet();

  await worksheet.addRow({
    Date: input.date,
    Amount: Number(input.amount.toFixed(2)),
    Category: input.category,
    Merchant: input.merchant.trim(),
    User: input.user,
    Notes: input.notes?.trim() ?? "",
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

export async function getMonthlyTotal(referenceDate = new Date()): Promise<number> {
  const worksheet = await getWorksheet();
  const rows = await worksheet.getRows<Record<string, unknown>>();

  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);

  const total = rows
    .map((row) => normalizeRow(row.toObject()))
    .filter((row): row is TransactionRecord => row !== null)
    .filter((row) => {
      const date = new Date(`${row.date}T00:00:00`);
      return date >= start && date < end;
    })
    .reduce((sum, row) => sum + row.amount, 0);

  return Number(total.toFixed(2));
}
