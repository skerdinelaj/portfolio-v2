"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

/** Cycles through the given roles with a slide animation. */
export function RoleCycler({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % roles.length), 2500);
    return () => clearInterval(id);
  }, [roles.length]);

  return (
    <span className="relative inline-flex h-[1.4em] overflow-hidden align-bottom" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={roles[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="text-foreground"
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
