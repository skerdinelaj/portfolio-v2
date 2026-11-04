"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// Lets a client component inside the header (e.g. an open menu) keep it on screen
const PinContext = createContext<(pinned: boolean) => void>(() => {});

/** Keeps the header visible while `pinned` is true (shows it right away if it was hidden). */
export function usePinHeader(pinned: boolean) {
  const setPinned = useContext(PinContext);
  useEffect(() => {
    setPinned(pinned);
    return () => setPinned(false);
  }, [pinned, setPinned]);
}

/**
 * A sticky <header> that slides away while scrolling down and comes back on any scroll up (always shown near the top).
 * Only the hide/show behaviour is client code: the contents are passed in as server-rendered `children`.
 * Client components among those children can still read this component's context (see `usePinHeader`).
 */
export function AutoHideHeader({ children, className }: { children: ReactNode; className?: string }) {
  const [hidden, setHidden] = useState(false);
  const [pinned, setPinned] = useState(false);
  const { scrollY } = useScroll();
  // Pinning also un-hides, so after the menu closes the header stays until the next scroll down
  const pin = useCallback((p: boolean) => {
    setPinned(p);
    if (p) setHidden(false);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 80) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  return (
    <PinContext value={pin}>
      <motion.header
        animate={{ y: hidden && !pinned ? "-100%" : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        // Keyboard users tabbing into the header must be able to see it
        onFocusCapture={() => setHidden(false)}
        className={className}
      >
        {children}
      </motion.header>
    </PinContext>
  );
}
