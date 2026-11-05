"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GlassWindow } from "@/components/ui/GlassWindow";

type Phase = "out" | "in";

const SPRING = { type: "spring", stiffness: 300, damping: 24 } as const;
// Pause the float while the pointer is over a window or focus is inside it
const floating = "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]";
const backdrop: Variants = { out: { opacity: 0, transition: { duration: 0.25 } }, in: { opacity: 1, transition: { duration: 0.25 } } };
// Big card: springs up from below with a slight tilt; leaves the same way.
// The fade animates `--window-opacity`, not `opacity`: GlassWindow applies the variable to the glass itself. Fading this
// wrapper instead would switch the glass blur off for the whole animation (the illustration behind showed through
// sharply, then the blur popped on: a "flash").
const big: Variants = {
  out: { "--window-opacity": 0, y: 60, scale: 0.92, rotate: -3, transition: { duration: 0.25, ease: "easeIn" } },
  in: { "--window-opacity": 1, y: 0, scale: 1, rotate: 0, transition: SPRING },
};
// Small card: swings in from the side a beat later; leaves first
const small: Variants = {
  out: { "--window-opacity": 0, x: 40, y: 20, scale: 0.85, rotate: 8, transition: { duration: 0.2, ease: "easeIn" } },
  in: { "--window-opacity": 1, x: 0, y: 0, scale: 1, rotate: 0, transition: { ...SPRING, delay: 0.12 } },
};

/**
 * The contact popup (rendered by the intercepting route `@modal/(.)contact`): two floating cards in the middle of the
 * screen, the form (`children`) and the social links (`links`).
 * - Closing the big card (✕, Esc, backdrop) closes both: they animate out, then `router.back()` leaves /contact.
 * - Closing the small card only hides that card; the big one glides back to the centre (`layout`).
 * With Cache Components the closed popup stays in the DOM, hidden by <Activity>, and keeps its React state. The
 * layout effect below runs every time it's shown or hidden, so each opening starts fresh and animates in again.
 */
export function ContactModal({ children, links }: { children: ReactNode; links: ReactNode }) {
  const router = useRouter();
  const groupRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("out");
  const [showLinks, setShowLinks] = useState(true);
  const closing = useRef(false);

  // Shown (first time or again after being hidden): animate in on the next frame, from the "out" pose.
  // Hidden: reset everything for next time (the guide's pattern: reset transient UI in the cleanup).
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setPhase("in"));
    return () => {
      cancelAnimationFrame(frame);
      closing.current = false;
      setShowLinks(true);
      setPhase("out");
    };
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setPhase("out"); // the big card's onAnimationComplete finishes the job
  }, []);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Move focus to the dialog itself (screen readers announce "Let's talk."; the next Tab lands in the form).
    // Not straight into the first field: the form card holds still while focus is inside it, so it wouldn't float.
    groupRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [close]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-3 sm:p-6"
      // Keep wheel and presses inside the popup: the home ring and the photo brush listen on window
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <motion.div aria-hidden variants={backdrop} initial="out" animate={phase} onClick={close} className="fixed inset-0 bg-background/60 backdrop-blur-[3px]">
        {/* Sun (light) / moon (dark) glow behind the windows: the light that shines through the frosted glass */}
        <div className="absolute top-1/2 left-1/2 size-[min(44rem,95vw)] -translate-1/2 rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-80 blur-3xl" />
      </motion.div>

      <div
        ref={groupRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="contact-title"
        // The group box is invisible and as tall as the form window: let clicks on its empty parts (under the links
        // window, between the windows) fall through to the backdrop, which closes. The windows take clicks again.
        className="pointer-events-none relative flex w-full max-w-[26rem] flex-col gap-5 outline-none sm:max-w-[50rem] sm:flex-row sm:items-start sm:justify-center sm:gap-5"
      >
        {/* Floating: a slow bob on a wrapper around each window (the window itself already uses transform for its
            spring in/out, so the two animations live on separate elements). A window holds still while you point at
            it or type in it. */}
        <motion.div layout className={`pointer-events-auto w-full sm:max-w-[30rem] ${floating} motion-safe:animate-float`}>
          <motion.div
            variants={big}
            initial="out"
            animate={phase}
            onAnimationComplete={(name) => {
              if (name === "out" && closing.current) router.back();
            }}
          >
            <GlassWindow title="Let's talk." titleId="contact-title" onClose={close} closeLabel="Close" orbitDuration={18}>
              {children}
            </GlassWindow>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showLinks && (
            <motion.div key="links" exit="out" className={`pointer-events-auto w-full shrink-0 sm:w-72 ${floating} motion-safe:animate-float-slow`}>
              <motion.aside aria-label="Other ways to reach me" variants={small} initial="out" animate={phase} exit="out">
                <GlassWindow title="Find me on" onClose={() => setShowLinks(false)} closeLabel="Hide these links" orbitDuration={11}>
                  {links}
                </GlassWindow>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
