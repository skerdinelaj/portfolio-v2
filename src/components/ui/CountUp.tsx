"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts from 0 to `to` the first time it scrolls into view. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, to, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  return (
    <span ref={ref}>
      {to}
      {suffix}
    </span>
  );
}
