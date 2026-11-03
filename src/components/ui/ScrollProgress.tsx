"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin accent bar at the very top of the viewport that fills as the page is scrolled. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  // Spring-smoothed so it glides instead of jumping with each wheel tick
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent" style={{ scaleX }} />;
}
