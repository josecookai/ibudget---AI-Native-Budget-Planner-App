import { ScanBillClient } from "@/components/scan-bill-client";
import { getMonthlyTotal, getRecentTransactions } from "@/lib/google-sheets";
import { type TransactionRecord } from "@/lib/transaction-types";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  let monthlyTotal = 0;
  let recentTransactions: TransactionRecord[] = [];
  let dashboardError: string | null = null;

  try {
    [monthlyTotal, recentTransactions] = await Promise.all([
      getMonthlyTotal(),
      getRecentTransactions(5),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown dashboard error";
    dashboardError = `Dashboard unavailable: ${message}`;
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <section className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            HomeWise AI
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Scan Receipt</h1>
          <p className="text-sm text-zinc-600">
            Upload a photo, confirm details, and save to your Google Sheet.
          </p>
        </header>

        <ScanBillClient
          initialMonthlyTotal={monthlyTotal}
          initialTransactions={recentTransactions}
          dashboardError={dashboardError}
          pinEnabled={Boolean(process.env.APP_PIN)}
        />
      </section>
    </main>
  );
}

