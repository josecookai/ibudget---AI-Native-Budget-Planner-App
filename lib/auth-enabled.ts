import "server-only";

// Auth is considered "enabled" only when the email magic-link sender is configured.
// This keeps preview deployments usable while wiring up Resend + domain DNS.
export function isAuthEnabled(): boolean {
  const authUrl = (process.env.NEXTAUTH_URL || process.env.AUTH_URL || "").trim();
  const authSecret = (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "").trim();
  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  const emailFrom = (process.env.EMAIL_FROM || "").trim();

  return Boolean(authUrl && authSecret && resendKey && emailFrom);
}

