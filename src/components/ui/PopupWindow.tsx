"use client";

import { motion, type Variants } from "motion/react";
import { useEffectEvent, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GlassWindow } from "@/components/ui/GlassWindow";

type Phase = "out" | "in";

const round = (n: number) => Math.round(n * 100) / 100;

const backdrop: Variants = {
  out: { opacity: 0, transition: { duration: 0.2 } },
  in: { opacity: 1, transition: { duration: 0.25 } },
};
// The window grows out of the `origin` element and shrinks back into it: `transformOrigin` is set to that element's
// centre (see `aim`), so animating `scale` alone does the travelling. Closing eases in, so it speeds up as it's
// "sucked in". The window fades via `--window-opacity` (GlassWindow applies it to the glass itself), never `opacity`
// on this wrapper: a fading ancestor switches the blur off for the whole animation.
const card: Variants = {
  out: { "--window-opacity": 0, scale: 0, transition: { duration: 0.32, ease: [0.55, 0, 0.9, 0.4] } },
  in: {
    "--window-opacity": 1,
    scale: 1,
    transition: { scale: { type: "spring", stiffness: 260, damping: 24 }, "--window-opacity": { duration: 0.18 } },
  },
};

/**
 * A celestial-glass popup that grows out of the element you clicked and shrinks back into it (Experience stars,
 * Projects windows). The parent owns `open`; closing (✕, Esc, backdrop) animates out first, then calls `onClosed`,
 * and the parent sets `open` to false.
 * It's a native <dialog> opened with `showModal()`: the browser puts it in the top layer (above the header), makes the
 * rest of the page inert (no clicks, no Tab) and turns Esc into a `cancel` event, which we intercept to animate out.
 * The dialog itself is a transparent full-screen box: our own backdrop and window animate inside it (the native
 * ::backdrop can't run an exit animation). While closed it's `display: none`, but its children are in the HTML.
 */
export function PopupWindow({
  open,
  title,
  origin,
  onClosed,
  maxWidth = "max-w-2xl",
  children,
}: {
  open: boolean;
  title: string;
  /** The element the window grows out of and shrinks back into. Read when opening and when closing. */
  origin: () => Element | null | undefined;
  onClosed: () => void;
  maxWidth?: string;
  children: ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("out");
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boxRef = useRef<HTMLDivElement>(null); // the window's untransformed box
  const closing = useRef(false);
  const titleId = useId();

  // Point the window's transform-origin at the origin element's centre. Measured on the window's wrapper, which is
  // never transformed, so its box is where the window sits at full size.
  const aim = () => {
    const box = boxRef.current?.getBoundingClientRect();
    const from = origin()?.getBoundingClientRect();
    if (box && from)
      setTransformOrigin(
        `${round(from.left + from.width / 2 - box.left)}px ${round(from.top + from.height / 2 - box.top)}px`,
      );
  };
  // The parent's latest `onClosed`, callable from the effect below without making it a dependency (a new function
  // every parent render would otherwise re-run the effect, closing and reopening the dialog)
  const closed = useEffectEvent(() => onClosed());
  const aimOnOpen = useEffectEvent(() => aim()); // same reason: `aim` reads the latest `origin` prop

  // Open: show the dialog, lock the page scroll (phones), aim, and grow on the next frame.
  // Cleanup runs on close AND when the page is hidden by <Activity> (navigating away): either way, close the dialog,
  // unlock, put focus back where it was (the element that opened it), and reset so the next opening starts fresh.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    dialog.showModal();
    // showModal() focuses the ✕ while the window is still scale(0) at the origin, and the browser scrolls the dialog to
    // reach it: with a long popup and an origin low on the page (phones), it would open scrolled half way down
    dialog.scrollTop = 0;
    html.style.overflow = "hidden";
    aimOnOpen(); // the dialog is laid out now, so the window's box can be measured
    const frame = requestAnimationFrame(() => setPhase("in"));
    return () => {
      cancelAnimationFrame(frame);
      if (dialog.open) dialog.close();
      html.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
      closing.current = false;
      setPhase("out");
      closed();
    };
  }, [open]);

  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    aim(); // the origin may have moved since opening (window resized)
    setPhase("out"); // the window's onAnimationComplete finishes the job
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault(); // Esc: animate out first
        requestClose();
      }}
      onClose={onClosed} // closed some other way (e.g. a second Esc the browser won't let us cancel)
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto border-0 bg-transparent p-3 text-foreground outline-none backdrop:bg-transparent sm:p-6"
    >
      <motion.div
        aria-hidden
        variants={backdrop}
        initial="out"
        animate={phase}
        onClick={requestClose}
        className="fixed inset-0 bg-background/60 backdrop-blur-[3px]"
      >
        {/* Sun (light) / moon (dark) glow behind the window, as in the contact popup */}
        <div className="absolute top-1/2 left-1/2 size-[min(44rem,95vw)] -translate-1/2 rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-80 blur-3xl" />
      </motion.div>
      {/* pointer-events-none: clicks beside the window fall through to the backdrop, which closes */}
      <div className="pointer-events-none relative flex min-h-full items-center justify-center">
        <div ref={boxRef} className={`pointer-events-auto w-full ${maxWidth}`}>
          <motion.div
            variants={card}
            initial="out"
            animate={phase}
            style={{ transformOrigin }}
            onAnimationComplete={(name) => {
              if (name === "out" && closing.current) onClosed();
            }}
          >
            <GlassWindow title={title} titleId={titleId} onClose={requestClose} closeLabel="Close" orbitDuration={22}>
              {children}
            </GlassWindow>
          </motion.div>
        </div>
      </div>
    </dialog>
  );
}
