"use client";

import { MotionConfig } from "motion/react";

/** Turns off movement animations for users who enable "reduce motion". */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
