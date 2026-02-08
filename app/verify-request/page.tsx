import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyRequestPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12 text-zinc-900">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a sign-in link. Open it on this device to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600">
            <p>If you do not see it, check your spam folder.</p>
            <p className="mt-4">
              <Link href="/login" className="font-medium text-zinc-900 underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

