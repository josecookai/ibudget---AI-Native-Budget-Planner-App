"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

const cardBase =
  "rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm";

type BentoCardProps = {
  children: ReactNode;
  className?: string;
  /** Grid area: "large" | "small" | "tall" for layout */
  size?: "large" | "small" | "tall";
  /** Optional delay for stagger animation */
  delay?: number;
};

export function BentoCard({
  children,
  className = "",
  size = "large",
  delay = 0,
}: BentoCardProps) {
  const gridClass =
    size === "large"
      ? "md:col-span-2 md:row-span-1"
      : size === "tall"
        ? "md:col-span-1 md:row-span-2"
        : "md:col-span-1 md:row-span-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={`${cardBase} ${gridClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}

type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-5 ${className}`}
    >
      {children}
    </div>
  );
}
