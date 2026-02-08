"use client";

import { motion } from "framer-motion";

const placeholderLogos = [
  "Partner A",
  "Partner B",
  "Partner C",
  "Partner D",
  "Partner E",
  "Partner F",
];

export function LogoWall() {
  return (
    <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium uppercase tracking-wider text-zinc-500"
        >
          Backed by
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {placeholderLogos.map((name, i) => (
            <div
              key={name}
              className="flex h-10 items-center rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-6 text-sm font-medium text-zinc-500"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
