"use client";

import { motion } from "motion/react";

/**
 * Fades its children in and springs them into place (with a small overshoot) when they scroll into view.
 * `x` slides sideways instead of up.
 */
export function Reveal({
  children,
  delay = 0,
  x = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  x?: number;
  className?: string;
}) {
  const spring = { type: "spring", bounce: 0.35, duration: 0.8, delay } as const;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y: x ? 0 : 32 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      // Movement bounces; opacity eases so it never overshoots
      transition={{ x: spring, y: spring, opacity: { duration: 0.4, ease: "easeOut", delay } }}
    >
      {children}
    </motion.div>
  );
}
