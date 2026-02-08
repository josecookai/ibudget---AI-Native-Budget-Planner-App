import "server-only";

import { randomUUID } from "node:crypto";

import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";

import { getOrCreateWorksheet } from "@/lib/sheets-client";

const USERS_SHEET_TITLE = process.env.GOOGLE_USERS_TAB_NAME?.trim() || "Users";
const TOKENS_SHEET_TITLE =
  process.env.GOOGLE_AUTH_TOKENS_TAB_NAME?.trim() || "VerificationTokens";

const USERS_HEADERS = [
  "UserId",
  "Email",
  "DisplayName",
  "Role",
  "CreatedAt",
  "EmailVerified",
  "Image",
] as const;

const TOKENS_HEADERS = ["identifier", "token", "expires"] as const;

type SheetRow = Record<string, any>;

async function getUsersSheet() {
  return getOrCreateWorksheet({
    title: USERS_SHEET_TITLE,
    requiredHeaders: [...USERS_HEADERS],
  });
}

async function getTokensSheet() {
  return getOrCreateWorksheet({
    title: TOKENS_SHEET_TITLE,
    requiredHeaders: [...TOKENS_HEADERS],
  });
}

function rowToUser(row: SheetRow): AdapterUser {
  return {
    id: String(row.UserId),
    email: String(row.Email),
    name: row.DisplayName ? String(row.DisplayName) : null,
    image: row.Image ? String(row.Image) : null,
    emailVerified: row.EmailVerified ? new Date(String(row.EmailVerified)) : null,
  };
}

export async function getUserRoleById(userId: string): Promise<string | null> {
  const sheet = await getUsersSheet();
  const rows = await sheet.getRows<SheetRow>();
  const row = rows.find((r) => String(r.get("UserId")) === userId);
  if (!row) return null;
  const role = String(row.get("Role") ?? "").trim();
  return role || null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function SheetsAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const sheet = await getUsersSheet();
      const id = randomUUID();
      const createdAt = new Date().toISOString();

      await sheet.addRow({
        UserId: id,
        Email: normalizeEmail(data.email),
        DisplayName: data.name ?? "",
        Role: "Helper",
        CreatedAt: createdAt,
        EmailVerified: data.emailVerified ? data.emailVerified.toISOString() : "",
        Image: data.image ?? "",
      });

      return {
        id,
        email: normalizeEmail(data.email),
        name: data.name ?? null,
        image: data.image ?? null,
        emailVerified: data.emailVerified ?? null,
      };
    },

    async getUser(id: string) {
      const sheet = await getUsersSheet();
      const rows = await sheet.getRows<SheetRow>();
      const row = rows.find((r) => String(r.get("UserId")) === id);
      if (!row) return null;
      return rowToUser(row.toObject());
    },

    async getUserByEmail(email: string) {
      const sheet = await getUsersSheet();
      const target = normalizeEmail(email);
      const rows = await sheet.getRows<SheetRow>();
      const row = rows.find((r) => normalizeEmail(String(r.get("Email"))) === target);
      if (!row) return null;
      return rowToUser(row.toObject());
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const sheet = await getUsersSheet();
      const rows = await sheet.getRows<SheetRow>();
      const row = rows.find((r) => String(r.get("UserId")) === data.id);
      if (!row) {
        // Upsert behavior.
        await sheet.addRow({
          UserId: data.id,
          Email: normalizeEmail(data.email ?? ""),
          DisplayName: data.name ?? "",
          Role: "Helper",
          CreatedAt: new Date().toISOString(),
          EmailVerified: data.emailVerified ? data.emailVerified.toISOString() : "",
          Image: data.image ?? "",
        });
        return {
          id: data.id,
          email: normalizeEmail(data.email ?? ""),
          name: data.name ?? null,
          image: data.image ?? null,
          emailVerified: data.emailVerified ?? null,
        };
      }

      // Preserve role/createdAt unless explicitly changed in sheet.
      if (data.email) row.set("Email", normalizeEmail(data.email));
      if (typeof data.name !== "undefined") row.set("DisplayName", data.name ?? "");
      if (typeof data.image !== "undefined") row.set("Image", data.image ?? "");
      if (typeof data.emailVerified !== "undefined")
        row.set("EmailVerified", data.emailVerified ? data.emailVerified.toISOString() : "");

      await row.save();
      return rowToUser(row.toObject());
    },

    async deleteUser(id: string) {
      const sheet = await getUsersSheet();
      const rows = await sheet.getRows<SheetRow>();
      const row = rows.find((r) => String(r.get("UserId")) === id);
      if (row) await row.delete();
    },

    // Email magic links require verification tokens.
    async createVerificationToken(token: VerificationToken) {
      const sheet = await getTokensSheet();
      await sheet.addRow({
        identifier: token.identifier,
        token: token.token,
        expires: token.expires.toISOString(),
      });
      return token;
    },

    async useVerificationToken(params: { identifier: string; token: string }) {
      const sheet = await getTokensSheet();
      const rows = await sheet.getRows<SheetRow>();
      const match = rows.find(
        (r) =>
          String(r.get("identifier")) === params.identifier &&
          String(r.get("token")) === params.token
      );
      if (!match) return null;

      const used: VerificationToken = {
        identifier: String(match.get("identifier")),
        token: String(match.get("token")),
        expires: new Date(String(match.get("expires"))),
      };

      await match.delete();
      return used;
    },

    // Unused for email-only + JWT sessions right now.
    async linkAccount(_account: AdapterAccount) {
      return;
    },
    async unlinkAccount(_params: { provider: string; providerAccountId: string }) {
      return;
    },
    async getUserByAccount(_account: { provider: string; providerAccountId: string }) {
      return null;
    },

    async createSession(_session: AdapterSession) {
      throw new Error("Database sessions are not enabled (JWT only).");
    },
    async getSessionAndUser(_sessionToken: string) {
      return null;
    },
    async updateSession(
      _session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ) {
      return null;
    },
    async deleteSession(_sessionToken: string) {
      return;
    },
  };
}
