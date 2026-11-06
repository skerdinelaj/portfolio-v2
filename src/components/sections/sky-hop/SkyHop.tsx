"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { usePinHeader } from "@/components/ui/AutoHideHeader";
import { BirdShapes } from "@/components/ui/Bird";
import { SkyHopGame } from "./SkyHopGame";

/**
 * The bored little bird in the header. Clicking it drops a panel out of the header (header + panel = 80% of the screen
 * on phones, half of it from `md` up)
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
          {/* Two drawings of the bird: side view (flying) and front view (smiling at you). Hover or keyboard focus
              swaps them with a quick squeeze, so it looks like the bird turns round. Both scale about the viewBox
              centre (SVG's default transform-box), which is the middle of the bird. */}
          <svg viewBox="0 0 40 36" className="h-7 w-8 transition-transform group-hover:-translate-y-0.5" aria-hidden>
            <g className="transition duration-200 group-hover:scale-x-0 group-hover:opacity-0 group-focus-visible:scale-x-0 group-focus-visible:opacity-0">
              <BirdShapes />
            </g>
            <g className="scale-x-0 opacity-0 transition duration-200 group-hover:scale-x-100 group-hover:opacity-100 group-hover:delay-75 group-focus-visible:scale-x-100 group-focus-visible:opacity-100">
              <g className="stroke-foreground" strokeWidth="1.6" strokeLinejoin="round">
                <ellipse cx="20" cy="5" rx="2" ry="3.5" className="fill-rose" />
                <ellipse cx="8.5" cy="21" rx="2.5" ry="4.5" transform="rotate(25 8.5 21)" className="fill-rose" />
                <ellipse cx="31.5" cy="21" rx="2.5" ry="4.5" transform="rotate(-25 31.5 21)" className="fill-rose" />
                <circle cx="20" cy="19" r="11" className="fill-butter" />
                <ellipse cx="20" cy="24.5" rx="6" ry="3.5" className="fill-peach" strokeWidth="0" />
                <circle cx="15.5" cy="15.5" r="2.6" className="fill-surface" />
                <circle cx="24.5" cy="15.5" r="2.6" className="fill-surface" />
                <path d="M18 18 L22 18 L20 20.5 Z" className="fill-peach" strokeWidth="1.2" />
                <path d="M16 22.5 Q20 26.5 24 22.5" fill="none" strokeLinecap="round" />
              </g>
              <circle cx="15.5" cy="15.8" r="1.2" className="fill-foreground" />
              <circle cx="24.5" cy="15.8" r="1.2" className="fill-foreground" />
              <circle cx="12" cy="20" r="1.6" className="fill-rose" />
              <circle cx="28" cy="20" r="1.6" className="fill-rose" />
            </g>
          </svg>
        </span>
        {/* The speech bubble is also the button's accessible name */}
        <span className="text-xs whitespace-nowrap decoration-accent underline-offset-4 group-hover:underline">
          {open ? "Back to work!" : "Bored? Click me!"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          // An invisible backdrop over the page below the header: a click there only closes the game and never reaches
          // the link or card underneath (closing on the page's own pointerdown would still let its click through).
          // The header isn't covered, so the menu and theme toggle keep working mid-run. It's not `fixed`: the header's
          // backdrop-filter makes the header the containing block for fixed children anyway. It stays mounted during
          // the exit animation, so a slow tap's click still lands on it.
          <motion.div
            key="backdrop"
            aria-hidden
            onClick={() => setOpenOn(null)} // no focus move: you clicked somewhere else on purpose
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="absolute inset-x-0 top-full h-dvh"
          />
        )}
        {open && (
          // The outer box is fixed under the header and clips; the inner sheet slides down out of the navbar's bottom
          // edge and back up into it on close. Only `transform` animates (GPU-composited, no layout or repaint per
          // frame), and an ease-out tween instead of a spring: no overshoot that would show a gap under the header.
          <div
            id={panelId}
            // React's stopPropagation also stops the native event at the root, so the home ring's window listeners
            // don't turn the ring while you play
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            // pb-10 leaves room for the sheet's shadow inside the clip; pointer-events-none lets presses there reach the page
            key="panel"
            className="pointer-events-none absolute inset-x-0 top-full overflow-hidden pb-10"
          >
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ y: "-100%", transition: { duration: 0.3, ease: [0.55, 0, 0.75, 0.06] } }}
              // Solid background, no blur: the header already has a backdrop-filter, and a nested one can't see the page
              className="pointer-events-auto h-[max(16rem,calc(80dvh-3.5rem))] md:h-[max(16rem,calc(50dvh-3.5rem))] border-b border-border bg-background shadow-[0_24px_40px_-24px_rgb(0_0_0/0.35)] will-change-transform"
            >
              <SkyHopGame onClose={close} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
