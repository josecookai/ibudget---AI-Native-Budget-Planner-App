import { HeroSection } from "@/components/hero-section";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Apple, PiggyBank, Receipt } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h2 className="sr-only">Features</h2>
        <BentoGrid>
          <BentoCard size="tall" delay={0}>
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {["bg-violet-500", "bg-blue-500", "bg-rose-500"].map((bg) => (
                  <div
                    key={bg}
                    className={`h-12 w-12 rounded-full border-2 border-zinc-900 ${bg}`}
                    aria-hidden
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
                Family Sync
              </h3>
              <p className="text-center text-sm text-zinc-400">
                Mom, Dad, and helpers see the same numbers. One source of truth.
              </p>
            </div>
          </BentoCard>
          <BentoCard size="large" delay={0.1}>
            <div className="flex h-full min-h-[220px] flex-col justify-between md:min-h-[200px]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-400">
                  <Receipt className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-zinc-50">
                    Snap & Forget
                  </h3>
                  <p className="mt-1 text-zinc-400">
                    Point your camera at a receipt. We turn it into structured
                    data—no typing, no spreadsheets.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <div className="h-16 w-20 rounded-lg border border-zinc-800 bg-zinc-800/50" />
                <span className="text-zinc-500">→</span>
                <div className="h-16 w-24 rounded-lg border border-zinc-700 bg-zinc-800/80" />
              </div>
            </div>
          </BentoCard>
          <BentoCard size="small" delay={0.2}>
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <PiggyBank className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
                Smart Savings
              </h3>
              <p className="text-2xl font-bold text-emerald-400">+15% saved</p>
              <p className="text-sm text-zinc-400">
                Insights that help families spend less without the hassle.
              </p>
            </div>
          </BentoCard>
        </BentoGrid>
      </section>

      <footer className="border-t border-zinc-800 bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 md:flex-row md:justify-between">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
            <a href="#" className="transition hover:text-zinc-50">
              Privacy
            </a>
            <a href="#" className="transition hover:text-zinc-50">
              Terms
            </a>
            <a href="#" className="transition hover:text-zinc-50">
              Support
            </a>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-50 transition hover:border-violet-500/50 hover:bg-zinc-800/80"
          >
            <Apple className="h-4 w-4" />
            Download on App Store
          </a>
        </div>
        <p className="border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} HomeWise AI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
