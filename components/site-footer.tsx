"use client";

import { Apple, FileText, Mail } from "lucide-react";
import Link from "next/link";

const social = [
  { name: "Twitter", href: "#", icon: "X" },
  { name: "Instagram", href: "#", icon: "IG" },
  { name: "TikTok", href: "#", icon: "TT" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight text-zinc-50">
              HomeWise AI
            </p>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              Your family&apos;s invisible accountant. Zero manual entry—just
              snap a photo.
            </p>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Product
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-zinc-400 hover:text-zinc-50">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/scan" className="text-sm text-zinc-400 hover:text-zinc-50">
                    Scan bill
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-sm text-zinc-400 hover:text-zinc-50">
                    Download app
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Resources
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="mailto:support@homewise.ai"
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@homewise.ai"
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 border-t border-zinc-800/80 pt-10 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            {social.map((s) => (
              <a
                key={s.name}
                href={s.href}
                className="rounded-lg border border-zinc-700/80 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-50"
                aria-label={s.name}
              >
                {s.icon}
              </a>
            ))}
            <span className="text-zinc-600">|</span>
            <a
              href="mailto:support@homewise.ai"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50"
            >
              <FileText className="h-3.5 w-3.5" />
              Support
            </a>
            <a
              href="mailto:support@homewise.ai"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact
            </a>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-50 transition hover:border-violet-500/50 hover:bg-zinc-800/80"
          >
            <Apple className="h-4 w-4" />
            Download on App Store
          </a>
        </div>

        <p className="mt-8 border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} HomeWise AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
