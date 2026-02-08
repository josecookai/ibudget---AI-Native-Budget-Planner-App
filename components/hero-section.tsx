"use client";

import { Apple } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:justify-between md:gap-12">
        <div className="flex max-w-xl flex-col gap-6 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-semibold tracking-tight text-zinc-50 md:text-5xl lg:text-6xl"
          >
            <span
              className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-500 bg-clip-text text-transparent"
            >
              Your Family&apos;s Invisible Accountant.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-zinc-400 md:text-xl"
          >
            Zero manual entry. Just snap a photo. Perfect for busy moms and
            helpers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center md:justify-start"
          >
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3.5 text-base font-medium text-zinc-50 shadow-[0_0_24px_-4px_rgba(139,92,246,0.35)] transition hover:border-violet-500/50 hover:bg-zinc-800/80 hover:shadow-[0_0_32px_-4px_rgba(139,92,246,0.45)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              <Apple className="h-5 w-5" aria-hidden />
              Download on App Store
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative flex-shrink-0"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            {/* iPhone mockup placeholder */}
            <div
              className="h-[420px] w-[220px] rounded-[2.5rem] border-[10px] border-zinc-800 bg-zinc-900 shadow-2xl md:h-[520px] md:w-[260px] md:rounded-[3rem] md:border-[12px]"
              aria-hidden
            >
              <div className="flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-zinc-950 md:rounded-[2rem]">
                <div className="flex items-center justify-center gap-1 border-b border-zinc-800/80 py-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                  <div className="h-2 w-2 rounded-full bg-zinc-600" />
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                </div>
                <div className="flex-1 space-y-3 p-4">
                  <div className="h-3 w-3/4 rounded bg-zinc-800" />
                  <div className="flex gap-2">
                    <div className="h-12 flex-1 rounded-lg bg-zinc-800/80" />
                    <div className="h-12 flex-1 rounded-lg bg-zinc-800/80" />
                  </div>
                  <div className="h-20 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2">
                    <div className="mb-2 h-2 w-1/2 rounded bg-zinc-700" />
                    <div className="h-2 w-full rounded bg-zinc-700/80" />
                    <div className="mt-1 h-2 w-2/3 rounded bg-zinc-700/60" />
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-14 flex-1 rounded-lg bg-zinc-800/60"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
