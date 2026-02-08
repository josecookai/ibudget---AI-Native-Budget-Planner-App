"use client";

import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sessionKey = "homewise_ai_unlocked";

export function PinGate({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    const unlocked = sessionStorage.getItem(sessionKey) === "1";
    if (unlocked) setIsUnlocked(true);
  }, [enabled]);

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

  if (!enabled || isUnlocked) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
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
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
            {pinError && <p className="text-sm text-red-600">{pinError}</p>}
            <Button className="w-full" onClick={handleUnlock} disabled={!pin || unlocking}>
              {unlocking ? "Unlocking..." : "Unlock"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

