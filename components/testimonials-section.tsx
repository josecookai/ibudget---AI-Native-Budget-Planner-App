"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Finally an expense app that doesn't feel like homework. I snap the receipt and it's done. Game changer for our family.",
    author: "Sarah L.",
    role: "Mom of two",
  },
  {
    quote:
      "We used to argue about who spent what. Now we both see the same dashboard. No more guessing.",
    author: "Mike T.",
    role: "Dad",
  },
  {
    quote:
      "As our family helper, I just take a photo of receipts and everything stays organized. So simple.",
    author: "Maria G.",
    role: "Family helper",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl"
      >
        What families say
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="mx-auto mt-3 max-w-xl text-center text-zinc-400"
      >
        Real stories from parents and helpers who made HomeWise AI part of their
        routine.
      </motion.p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={t.author}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <p className="text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4">
              <p className="font-semibold text-zinc-50">{t.author}</p>
              <p className="text-sm text-zinc-500">{t.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </section>
  );
}
