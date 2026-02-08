import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { CategoryBarChart } from "@/components/category-bar-chart";
import { PinGate } from "@/components/pin-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAuthEnabled } from "@/lib/auth-enabled";
import { authOptions } from "@/lib/auth-options";
import { getMonthlyTransactions, getRecentTransactions } from "@/lib/google-sheets";
import { CATEGORY_VALUES, USER_VALUES } from "@/lib/transaction-types";

export const dynamic = "force-dynamic";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function DashboardPage() {
  const authRequired = isAuthEnabled();
  const session = authRequired ? await getServerSession(authOptions) : null;
  if (authRequired && !session?.user) redirect("/login");

  const [monthlyTransactions, recent] = await Promise.all([
    getMonthlyTransactions(),
    getRecentTransactions(20),
  ]);

  const monthlyTotal = monthlyTransactions.reduce((sum, row) => sum + row.amount, 0);

  const categoryTotals = CATEGORY_VALUES.map((category) => {
    const sum = monthlyTransactions
      .filter((t) => t.category === category)
      .reduce((acc, t) => acc + t.amount, 0);
    return { label: category, value: sum };
  }).filter((d) => d.value > 0);

  const userTotals = USER_VALUES.map((user) => {
    const sum = monthlyTransactions
      .filter((t) => t.user === user)
      .reduce((acc, t) => acc + t.amount, 0);
    return { user, sum };
  });

  return (
    <PinGate enabled={Boolean(process.env.APP_PIN)}>
      <main className="px-4 py-8">
        <section className="mx-auto w-full max-w-md space-y-6">
          <header className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">This Month</h1>
            {session?.user?.email ? (
              <p className="text-sm text-zinc-600">Signed in as {session.user.email}</p>
            ) : (
              <p className="text-sm text-zinc-600">PIN mode (auth not configured)</p>
            )}
          </header>

        <Card>
          <CardHeader>
            <CardDescription>Total Spent</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight">
              {formatCurrency(monthlyTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {userTotals.map((u) => (
              <div key={u.user} className="rounded-xl border border-zinc-200 bg-white p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {u.user}
                </p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">
                  {formatCurrency(u.sum)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>From your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryTotals.length === 0 ? (
              <p className="text-sm text-zinc-500">No data yet.</p>
            ) : (
              <CategoryBarChart data={categoryTotals} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Transactions</CardTitle>
            <CardDescription>Most recent 20</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-zinc-500">No transactions yet.</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((t, idx) => (
                  <li
                    key={`${t.date}-${t.merchant}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{t.merchant}</p>
                      <p className="text-xs text-zinc-500">
                        {t.date} • {t.category} • {t.user}
                      </p>
                    </div>
                    <div className="ml-3 text-sm font-semibold text-zinc-900 tabular-nums">
                      {formatCurrency(t.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        </section>
      </main>
    </PinGate>
  );
}
