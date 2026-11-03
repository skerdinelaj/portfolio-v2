"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";

/**
 * Vertical timeline whose accent line draws itself downward as the list scrolls through the viewport.
 * Children are the <li> items; put a <TimelineDot /> in each.
 */
export function Timeline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  // 0 when the list's top reaches 75% down the viewport, 1 when its bottom reaches 85% (reachable even at max scroll)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 85%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <ol ref={ref} className="relative ml-3">
      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-border" />
      <motion.span aria-hidden className="absolute inset-y-0 left-0 w-0.5 origin-top -translate-x-1/4 bg-accent" style={{ scaleY: reduce ? 1 : scaleY }} />
      {children}
    </ol>
  );
}

/** Dot that pops in with a bounce when the drawing line reaches it. */
export function TimelineDot() {
  return (
    <motion.span
      aria-hidden
      className="absolute -left-[7px] mt-2 size-3.5 rounded-full border-2 border-background bg-accent"
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -25% 0px" }}
      transition={{ type: "spring", stiffness: 400, damping: 14 }}
    />
  );
}
