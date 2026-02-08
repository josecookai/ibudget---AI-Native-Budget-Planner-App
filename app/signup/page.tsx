"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const res = await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: true,
      });
      if (res?.error) {
        setError(res.error);
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Create your account with a magic link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Sending link..." : "Email me a sign-up link"}
              </Button>
              <p className="text-xs text-zinc-500">
                You will get a sign-in link. This also works for existing users.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

