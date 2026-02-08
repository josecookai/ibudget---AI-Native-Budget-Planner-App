"use client";

import { motion } from "framer-motion";

const press = [
  { name: "TechCrunch", tagline: "Startup coverage" },
  { name: "Forbes", tagline: "Fintech" },
  { name: "The Verge", tagline: "App review" },
  { name: "Wired", tagline: "Productivity" },
];

export function PressSection() {
  return (
    <section className="border-t border-zinc-800/80 bg-zinc-900/30 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium uppercase tracking-wider text-zinc-500"
        >
          As seen in
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {press.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center gap-0.5 text-zinc-400"
            >
              <span className="text-lg font-semibold text-zinc-300">
                {item.name}
              </span>
              <span className="text-xs">{item.tagline}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
