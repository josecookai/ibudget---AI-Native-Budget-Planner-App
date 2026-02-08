import "server-only";

import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

import { SheetsAdapter, getUserRoleById } from "@/lib/nextauth-sheets-adapter";

function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
}

function getAuthUrl() {
  return process.env.NEXTAUTH_URL || process.env.AUTH_URL || "";
}

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const emailFrom = process.env.EMAIL_FROM?.trim();

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const authOptions: NextAuthOptions = {
  secret: getAuthSecret() || undefined,
  adapter: SheetsAdapter(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
  },
  providers: [
    EmailProvider({
      // NextAuth expects a "from", but in local/dev we can fall back if we're only logging links.
      from: emailFrom || (process.env.NODE_ENV !== "production" ? "no-reply@localhost" : undefined),
      // NextAuth email provider requires a DB (we use Sheets adapter) and a send function.
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        if (!resend) {
          if (process.env.NODE_ENV !== "production") {
            // Dev fallback: log the magic link for quick iteration without an email provider.
            // (Use Vercel logs if testing a preview deployment.)
            // eslint-disable-next-line no-console
            console.log(`[Auth] Magic link for ${identifier}: ${url}`);
            return;
          }
          throw new Error("RESEND_API_KEY is not configured.");
        }
        if (!provider.from) {
          throw new Error("EMAIL_FROM is not configured.");
        }

        const host = new URL(getAuthUrl() || url).host;
        const subject = `Sign in to ${host}`;

        const html = `
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
            <h2 style="margin: 0 0 12px 0;">HomeWise AI</h2>
            <p style="margin: 0 0 16px 0;">Click to sign in:</p>
            <p style="margin: 0 0 24px 0;">
              <a href="${url}" style="background:#111827;color:#ffffff;padding:10px 14px;border-radius:10px;text-decoration:none;display:inline-block;">
                Sign in
              </a>
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">If you did not request this email, you can ignore it.</p>
          </div>
        `;

        await resend.emails.send({
          from: provider.from,
          to: identifier,
          subject,
          html,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        const role = await getUserRoleById(user.id);
        if (role) token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        // @ts-expect-error augmenting session user
        session.user.id = token.userId;
        // @ts-expect-error augmenting session user
        session.user.role = token.role ?? "Helper";
      }
      return session;
    },
  },
};
