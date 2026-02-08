import "server-only";

import { GoogleAuth } from "google-auth-library";
import {
  GoogleSpreadsheet,
  type GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getServiceAccountAuth(): GoogleAuth {
  const clientEmail = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
}

let docPromise: Promise<GoogleSpreadsheet> | null = null;
const worksheetPromises = new Map<string, Promise<GoogleSpreadsheetWorksheet>>();

export async function getSpreadsheetDoc(): Promise<GoogleSpreadsheet> {
  if (!docPromise) {
    docPromise = (async () => {
      const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
      const auth = getServiceAccountAuth();
      const doc = new GoogleSpreadsheet(spreadsheetId, auth);
      await doc.loadInfo();
      return doc;
    })().catch((error) => {
      docPromise = null;
      throw error;
    });
  }

  return docPromise;
}

async function ensureHeaderRow(
  worksheet: GoogleSpreadsheetWorksheet,
  requiredHeaders: string[],
): Promise<string[]> {
  // Header values must be loaded before calling `addRow/getRows`.
  // If the sheet is blank, `loadHeaderRow()` throws and `headerValues` getter also throws.
  let existingHeaders: string[] = [];
  try {
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  } catch {
    await worksheet.setHeaderRow([...requiredHeaders]);
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  }

  if (existingHeaders.length === 0) {
    await worksheet.setHeaderRow([...requiredHeaders]);
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  }

  const missing = requiredHeaders.filter((header) => !existingHeaders.includes(header));
  if (missing.length > 0) {
    // Non-breaking: preserve existing order and append missing columns.
    await worksheet.setHeaderRow([...existingHeaders, ...missing]);
    await worksheet.loadHeaderRow();
    existingHeaders = worksheet.headerValues.filter(Boolean);
  }

  return existingHeaders;
}

export async function getOrCreateWorksheet(params: {
  title: string;
  requiredHeaders: string[];
}): Promise<GoogleSpreadsheetWorksheet> {
  const key = `${params.title}::${params.requiredHeaders.join("|")}`;
  const existing = worksheetPromises.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const doc = await getSpreadsheetDoc();
    let worksheet = doc.sheetsByTitle[params.title];

    if (!worksheet) {
      worksheet = await doc.addSheet({
        title: params.title,
        headerValues: params.requiredHeaders,
      });
    }

    await ensureHeaderRow(worksheet, params.requiredHeaders);
    return worksheet;
  })().catch((error) => {
    worksheetPromises.delete(key);
    throw error;
  });

  worksheetPromises.set(key, promise);
  return promise;
}

