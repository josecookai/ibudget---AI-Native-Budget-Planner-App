# HomeWise AI

**Your family's invisible accountant.**  
Snap a receipt. We extract the total + merchant + category. Save it to a shared Google Sheet. See your monthly dashboard.

## Links

- Landing: `/`
- Scan tool: `/scan`
- Dashboard: `/dashboard`
- Auth: `/login`, `/signup`

## What It Does (MVP Lite)

- **One-tap Scan Bill** (upload a receipt photo)
- **AI OCR (Gemini Vision)** extracts `{ amount, category, merchant, date }`
- **Google Sheets is the database** (transparent, low-cost, easy to audit)
- **Multi-user tracking** (`Mom` / `Helper`) + optional notes
- **Dashboard after save**: month total, per-user breakdown, recent list, simple charts
- **Auth.js magic-link login** (email sign-in), backed by Google Sheets
- **Optional PIN gate** for `/scan` + `/dashboard` (extra family privacy layer)

## How It Works

1. User signs in via email magic link.
2. User scans a receipt on `/scan`.
3. Server calls Gemini Vision, normalizes output to strict JSON.
4. Server appends a row to the `Transactions` sheet tab.
5. User is redirected to `/dashboard` to see totals + charts.

## Screenshots

![Mobile Scan](public/screenshots/home-mobile.png)

![PIN Gate](public/screenshots/pin-gate-mobile.png)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS, Shadcn-style local UI primitives, Lucide icons, Framer Motion (landing)
- **Auth:** Auth.js / NextAuth (email magic links)
- **Email:** Resend (recommended)
- **Data:** Google Sheets (`google-spreadsheet` + service account)
- **AI OCR:** Gemini (`@google/genai`)
- **Validation:** Zod

## Google Sheets Schema

### `Transactions` tab (required)

Columns (header row). Existing columns remain compatible; new ones are appended:

- `Date`
- `Amount`
- `Category`
- `Merchant`
- `User`
- `Notes`
- `UserId` (Auth.js user id; empty when auth is not enabled)
- `CreatedAt` (ISO datetime)

### `Users` tab (auto-created by adapter)

- `UserId`, `Email`, `DisplayName`, `Role`, `CreatedAt`, `EmailVerified`, `Image`

### `VerificationTokens` tab (auto-created by adapter)

- `identifier`, `token`, `expires`

## Environment Variables

See `.env.example`. Minimal set:

```bash
# AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash

# Sheets
GOOGLE_SHEET_ID=...
GOOGLE_SHEET_TAB_NAME=tst1
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Auth (required to enforce login)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-strong-secret
RESEND_API_KEY=...
EMAIL_FROM="HomeWise AI <no-reply@yourdomain.com>"

# Optional
APP_PIN=1234
```

Auth is enforced only when `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM` are configured. Otherwise the app runs in **PIN mode** (useful for previews while setting up email).

## Local Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Contracts

### `POST /api/process-bill`

Request:

```json
{ "imageBase64": "...", "mimeType": "image/jpeg" }
```

Response:

```json
{ "amount": 12.5, "category": "Food", "merchant": "Starbucks", "date": "2026-02-07" }
```

### `POST /api/save-transaction`

Request:

```json
{
  "amount": 12.5,
  "category": "Food",
  "merchant": "Starbucks",
  "date": "2026-02-07",
  "user": "Mom",
  "notes": "latte"
}
```

Response:

```json
{ "ok": true }
```
