# HomeWise AI

**AI-Native Budget Planner for Busy Families**  
Scan receipts in seconds, auto-categorize spend, and keep a shared home budget between Mom and Helper.

## Product Snapshot

HomeWise AI is a mobile-first MVP designed for non-technical users.  
The core idea is simple: **one giant Scan button, one AI extraction step, one Save action**.

## Why This Product

- Families need fast expense logging, not complex accounting screens.
- Helpers and moms both spend; tracking by user is critical.
- Google Sheets keeps the backend transparent and low-cost.

## Key Features (MVP Lite)

- One-tap **Scan Bill** flow (image upload, OCR, structured extraction)
- AI extraction via **GPT-4o Vision**
- Google Sheets as the source of truth (`Date`, `Amount`, `Category`, `Merchant`, `User`, `Notes`)
- PIN-protected access for household privacy
- Live dashboard with:
  - **Total Spent This Month**
  - **Last 5 Transactions**

## Product Design Screenshots

### 1) Home Screen (Mobile)

![Home Screen](public/screenshots/home-mobile.png)

### 2) PIN Lock Screen (Mobile)

![PIN Gate](public/screenshots/pin-gate-mobile.png)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS, Shadcn-style local UI primitives, Lucide icons
- **Data:** Google Sheets (`google-spreadsheet`)
- **AI OCR:** OpenAI (`gpt-4o`)
- **Validation:** Zod

## Architecture (MVP)

- `app/page.tsx` (server component)
  - Loads monthly total + latest transactions from Google Sheets
  - Renders scan/dashboard shell
- `components/scan-bill-client.tsx` (client component)
  - Handles image selection, Base64 conversion, OCR call, user selection, and save flow
- `app/api/process-bill/route.ts`
  - OCR extraction with strict JSON schema normalization
- `app/api/save-transaction/route.ts`
  - Appends normalized row to Google Sheets
- `app/api/verify-pin/route.ts`
  - PIN verification endpoint (timing-safe compare)
- `lib/google-sheets.ts`
  - Shared helper for connect/read/write to worksheet

## Environment Variables

Create `.env.local`:

```bash
OPENAI_API_KEY=sk-...
GOOGLE_SHEET_ID=...
GOOGLE_SHEET_TAB_NAME=Transactions
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
APP_PIN=1234
```

## Local Development

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

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

## Status

- MVP Lite v1 complete
- Ready for preview deployment and user testing
