"use client";

import {
  BarChart3,
  Bell,
  PiggyBank,
  Receipt,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Snap & Forget",
    description:
      "Point your camera at a receipt. We turn it into structured data—no typing, no spreadsheets.",
    icon: Receipt,
    gradient: "from-violet-500/20 to-blue-500/20",
    iconColor: "text-violet-400",
  },
  {
    title: "Smart Savings",
    description:
      "Insights that help families spend less. Track trends and see where you can save without the hassle.",
    icon: PiggyBank,
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
  {
    title: "Family Sync",
    description:
      "Mom, Dad, and helpers see the same numbers. One source of truth for the whole household.",
    icon: Users,
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
  },
  {
    title: "Budget by Category",
    description:
      "Set limits by category and get gentle nudges when you're close. No guilt, just clarity.",
    icon: BarChart3,
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-400",
  },
  {
    title: "Bill Reminders",
    description:
      "Never miss a due date. We remind you before bills hit so you're never caught off guard.",
    icon: Bell,
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconColor: "text-cyan-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl"
      >
        Built for family life
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="mx-auto mt-3 max-w-2xl text-center text-zinc-400"
      >
        Five ways we help busy households stay on top of spending—without the
        spreadsheets.
      </motion.p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
            >
              <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
