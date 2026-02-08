"use client";

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-50"
        >
          HomeWise AI
        </Link>
        <nav className="flex items-center gap-6">
          <a
            href="#features"
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-50"
          >
            Features
          </a>
          <Link
            href="/scan"
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-50"
          >
            Scan
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 transition hover:text-zinc-50"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
