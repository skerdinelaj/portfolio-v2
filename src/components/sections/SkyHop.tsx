"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { usePinHeader } from "@/components/ui/AutoHideHeader";
import { SkyHopGame } from "./SkyHopGame";

/**
 * The bored little bird in the header. Clicking it drops a panel out of the header (header + panel = half the screen)
 * with the Sky Hop game in it. The panel is absolutely positioned against the sticky <header>, so opening it
 * overlays the page instead of pushing it down (no layout shift, and home's one-screen height maths stays intact).
 * This wrapper must stay un-positioned, or `absolute` would anchor to it instead of the header.
 */
export function SkyHop() {
  const pathname = usePathname();
  // Remember which page it was opened on: navigating anywhere (including the contact popup) closes it, with no effect
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  usePinHeader(open); // the header mustn't slide away mid-game

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
      e.preventDefault(); // handled: PageBar's "Esc goes home" leaves it alone
      setOpenOn(null);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpenOn(null);
    buttonRef.current?.focus();
  };

  return (
    <div className="flex items-center px-2 sm:px-3">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpenOn(pathname))}
        className="group flex items-center gap-1.5 rounded-full p-1 text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <span className="motion-safe:animate-hop inline-block">
          <svg viewBox="0 0 40 36" className="h-7 w-8 transition-transform group-hover:-translate-y-0.5" aria-hidden>
            <g className="stroke-foreground" strokeWidth="1.6" strokeLinejoin="round">
              <ellipse cx="17" cy="5.5" rx="2" ry="3.5" transform="rotate(-25 17 5.5)" className="fill-rose" />
              <circle cx="18" cy="19" r="11" className="fill-butter" />
              <ellipse cx="20" cy="23.5" rx="6" ry="4" className="fill-peach" strokeWidth="0" />
              <g className="motion-safe:animate-wing origin-[14px_19px]">
                <ellipse cx="14" cy="19.5" rx="5.5" ry="3.2" className="fill-rose" />
              </g>
              <path d="M28 16.5 L35 19 L28 21.5 Z" className="fill-peach" />
              <circle cx="23" cy="15.5" r="2.8" className="fill-surface" />
            </g>
            <circle cx="23.8" cy="15.5" r="1.2" className="fill-foreground" />
          </svg>
        </span>
        {/* The speech bubble is also the button's accessible name */}
        <span className="glass-lite rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap group-hover:border-accent">
          {open ? "Back to work!" : "Bored? Click me!"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            // React's stopPropagation also stops the native event at the root, so the home ring's window listeners
            // don't turn the ring while you play
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            // Solid background, no blur: the header already has a backdrop-filter, and a nested one can't see the page
            className="absolute inset-x-0 top-full h-[max(16rem,calc(50dvh-3.5rem))] overflow-hidden border-b border-border bg-background shadow-[0_24px_40px_-24px_rgb(0_0_0/0.35)]"
          >
            <SkyHopGame onClose={close} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
