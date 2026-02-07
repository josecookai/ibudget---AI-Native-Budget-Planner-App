"use client";

import { Camera, Loader2, Lock, ReceiptText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CATEGORY_VALUES,
  USER_VALUES,
  type TransactionCategory,
  type TransactionRecord,
  type TransactionUser,
} from "@/lib/transaction-types";

interface OCRResult {
  amount: number;
  category: TransactionCategory;
  merchant: string;
  date: string;
}

interface ScanBillClientProps {
  initialMonthlyTotal: number;
  initialTransactions: TransactionRecord[];
  dashboardError: string | null;
  pinEnabled: boolean;
}

const sessionKey = "homewise_ai_unlocked";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDisplayDate(dateText: string): string {
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("File conversion failed"));
        return;
      }

      const [prefix, base64] = result.split(",");
      const mimeMatch = prefix.match(/^data:(.+);base64$/);
      const mimeType = mimeMatch?.[1] ?? file.type ?? "image/jpeg";

      if (!base64) {
        reject(new Error("File conversion failed"));
        return;
      }

      resolve({ base64, mimeType });
    };

    reader.onerror = () => {
      reject(new Error("Unable to read image file"));
    };

    reader.readAsDataURL(file);
  });
}

export function ScanBillClient({
  initialMonthlyTotal,
  initialTransactions,
  dashboardError,
  pinEnabled,
}: ScanBillClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!pinEnabled);

  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [selectedUser, setSelectedUser] = useState<TransactionUser | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!pinEnabled) {
      return;
    }

    const unlocked = sessionStorage.getItem(sessionKey) === "1";
    if (unlocked) {
      setIsUnlocked(true);
    }
  }, [pinEnabled]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date()),
    []
  );

  async function handleUnlock() {
    setPinError(null);
    setUnlocking(true);

    try {
      const response = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPinError(data.error ?? "PIN verification failed.");
        return;
      }

      sessionStorage.setItem(sessionKey, "1");
      setIsUnlocked(true);
      setPin("");
    } catch {
      setPinError("Unable to verify PIN right now.");
    } finally {
      setUnlocking(false);
    }
  }

  async function handleFileSelection(file: File) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);
    setOcrResult(null);
    setSelectedUser(null);
    setNotes("");

    try {
      const { base64, mimeType } = await fileToBase64(file);

      const response = await fetch("/api/process-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const data = (await response.json()) as OCRResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Bill processing failed.");
      }

      const category = CATEGORY_VALUES.includes(data.category)
        ? data.category
        : "Other";

      setOcrResult({
        amount: data.amount,
        category,
        merchant: data.merchant,
        date: data.date,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to process bill.";
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSave() {
    if (!ocrResult || !selectedUser) {
      setErrorMessage("Please select Mom or Helper before saving.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/save-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: ocrResult.amount,
          category: ocrResult.category,
          merchant: ocrResult.merchant,
          date: ocrResult.date,
          user: selectedUser,
          notes,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Unable to save transaction.");
      }

      setSuccessMessage("Saved to your expense dashboard.");
      setOcrResult(null);
      setSelectedUser(null);
      setNotes("");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save transaction.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {pinEnabled && !isUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 px-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-zinc-900">
                <Lock className="size-5" /> Enter PIN
              </CardTitle>
              <CardDescription>
                HomeWise is protected. Please enter your family PIN.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="4-digit PIN"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {pinError && <p className="text-sm text-red-600">{pinError}</p>}
              <Button
                className="w-full"
                onClick={handleUnlock}
                disabled={unlocking || !pin}
              >
                {unlocking ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Unlocking...
                  </>
                ) : (
                  "Unlock"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <Card className="border-zinc-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-zinc-900">Scan Your Bill</CardTitle>
            <CardDescription>
              Tap the button, upload a receipt photo, and confirm.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFileSelection(file);
                  event.currentTarget.value = "";
                }
              }}
            />

            <Button
              size="lg"
              className="h-32 w-full rounded-3xl text-xl font-semibold"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isSaving}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-3 size-7 animate-spin" />
                  AI is reading your bill...
                </>
              ) : (
                <>
                  <Camera className="mr-3 size-7" />
                  Scan Bill
                </>
              )}
            </Button>

            {errorMessage && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </p>
            )}

            {ocrResult && (
              <Card className="border-zinc-200 bg-zinc-50">
                <CardHeader>
                  <CardTitle className="text-base text-zinc-900">
                    Receipt Parsed
                  </CardTitle>
                  <CardDescription>
                    Check details, select user, then save.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="space-y-2 text-sm text-zinc-700">
                    <div className="flex items-center justify-between">
                      <dt>Amount</dt>
                      <dd className="font-semibold text-zinc-900">
                        {formatCurrency(ocrResult.amount)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Category</dt>
                      <dd className="font-medium text-zinc-900">{ocrResult.category}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Merchant</dt>
                      <dd className="font-medium text-zinc-900">{ocrResult.merchant}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Date</dt>
                      <dd className="font-medium text-zinc-900">{ocrResult.date}</dd>
                    </div>
                  </dl>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-900">Who paid?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {USER_VALUES.map((userValue) => (
                        <Button
                          key={userValue}
                          type="button"
                          variant={selectedUser === userValue ? "default" : "outline"}
                          onClick={() => setSelectedUser(userValue)}
                        >
                          {userValue}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-900" htmlFor="notes">
                      Notes (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      placeholder="Any extra detail"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={isSaving || !selectedUser}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Spent This Month ({monthLabel})</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight text-zinc-900">
              {formatCurrency(initialMonthlyTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Last 5 Transactions
            </h3>

            {dashboardError ? (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                {dashboardError}
              </p>
            ) : initialTransactions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500">
                No transactions yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {initialTransactions.map((transaction, index) => (
                  <li
                    key={`${transaction.date}-${transaction.merchant}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {transaction.merchant}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDisplayDate(transaction.date)} • {transaction.category} • {transaction.user}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <ReceiptText className="size-4 text-zinc-400" />
                      {formatCurrency(transaction.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
