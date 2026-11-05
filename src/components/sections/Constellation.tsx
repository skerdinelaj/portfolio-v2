"use client";

import { motion, type Variants } from "motion/react";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { GlassWindow } from "@/components/ui/GlassWindow";
import { Reveal } from "@/components/ui/Reveal";

type Star = { company: string; short: string; years: string };
type Phase = "out" | "in";

// Star heights (% from the top of the sky), cycled: a zig-zag reads as a constellation rather than a chart
const HEIGHTS = [66, 28, 60, 24, 48];
const round = (n: number) => Math.round(n * 100) / 100;

// Background dust. A seeded generator (not Math.random), so the server and the browser compute exactly the same
// positions and the hydrated markup matches.
let seed = 11;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const DUST = Array.from({ length: 60 }, () => ({
  left: `${round(rand() * 100)}%`,
  top: `${round(rand() * 100)}%`,
  big: rand() < 0.25,
  delay: `${round(rand() * 3.2)}s`,
}));

const backdrop: Variants = {
  out: { opacity: 0, transition: { duration: 0.2 } },
  in: { opacity: 1, transition: { duration: 0.25 } },
};
// The window grows out of the clicked star and shrinks back into it: `transformOrigin` is set to the star's dot (see
// `aim`), so animating `scale` alone does the travelling. Closing eases in, so it speeds up as it's "sucked in".
// The window fades via `--window-opacity` (GlassWindow applies it to the glass itself), never `opacity` on this
// wrapper: a fading ancestor switches the blur off for the whole animation.
const card: Variants = {
  out: {
    "--window-opacity": 0,
    scale: 0,
    transition: { duration: 0.32, ease: [0.55, 0, 0.9, 0.4] },
  },
  in: {
    "--window-opacity": 1,
    scale: 1,
    transition: {
      scale: { type: "spring", stiffness: 260, damping: 24 },
      "--window-opacity": { duration: 0.18 },
    },
  },
};

/**
 * The Experience sky: one star per job, oldest → newest, joined by a dashed path; a sage line fills the path up to
 * the last job you opened (today's job at first: "the road so far"). Clicking a star opens that job in a popup.
 * The popup is a native <dialog> opened with `showModal()`: the browser puts it in the top layer (above the header),
 * makes the rest of the page inert (no clicks, no Tab) and turns Esc into a `cancel` event. We only add the animation:
 * close = animate out, then `dialog.close()`.
 * `panels` are rendered on the server (one per star, same order); all stay in the HTML, the popup shows one.
 */
export function Constellation({ stars, panels }: { stars: Star[]; panels: ReactNode[] }) {
  const [selected, setSelected] = useState(stars.length - 1); // where the line stays: today's job, then the last one opened
  const [preview, setPreview] = useState<number | null>(null); // the star under the pointer / keyboard focus
  const [origin, setOrigin] = useState("50% 50%"); // the dot the window grows from, in the window's own pixels
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("out");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const skyRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const boxRef = useRef<HTMLDivElement>(null); // the window's untransformed box
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const openedRef = useRef(0); // the star the popup belongs to (written by the click handler only)
  const closing = useRef(false);
  const titleId = useId();

  // The path is drawn in pixels (so dashes keep their length at any width), which needs the sky's measured size.
  // Before that (server HTML, first paint) there is simply no line yet.
  useLayoutEffect(() => {
    const el = skyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Point the window's transform-origin at the opened star's dot. Measured on the window's wrapper, which is never
  // transformed, so its box is where the window sits at full size.
  const aim = () => {
    const box = boxRef.current?.getBoundingClientRect();
    const dot = dotRefs.current[openedRef.current]?.getBoundingClientRect();
    if (box && dot)
      setOrigin(`${round(dot.left + dot.width / 2 - box.left)}px ${round(dot.top + dot.height / 2 - box.top)}px`);
  };

  // Open: show the dialog, lock the page scroll (phones), animate in on the next frame.
  // Cleanup runs on close AND when the page is hidden by <Activity> (navigating away): either way, close the dialog,
  // unlock, put focus back on the star that opened it, and reset so the next opening starts fresh.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    dialog.showModal();
    html.style.overflow = "hidden";
    // The dialog is laid out now, so the window's box can be measured: aim at the star, then grow on the next frame
    aim();
    const frame = requestAnimationFrame(() => setPhase("in"));
    return () => {
      cancelAnimationFrame(frame);
      if (dialog.open) dialog.close();
      html.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
      closing.current = false;
      setPhase("out");
      setOpen(false);
    };
  }, [open]);

  const openJob = (i: number) => {
    openedRef.current = i;
    setSelected(i);
    setOpen(true);
  };
  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    aim(); // the star may have moved since opening (window resized)
    setPhase("out"); // the card's onAnimationComplete finishes the job
  };
  const lineTo = preview ?? selected;

  // Star positions in % of the sky; the ends stay 10% in so their labels never leave the screen
  const at = stars.map((_, i) => ({
    x: stars.length === 1 ? 50 : 10 + (i * 80) / (stars.length - 1),
    y: HEIGHTS[i % HEIGHTS.length],
  }));
  const px = at.map((p) => [(p.x / 100) * size.w, (p.y / 100) * size.h] as const);
  const points = px.map(([x, y]) => `${round(x)},${round(y)}`).join(" ");
  const upTo = px.reduce<number[]>((acc, [x, y], i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + Math.hypot(x - px[i - 1][0], y - px[i - 1][1]));
    return acc;
  }, []);
  const total = upTo.at(-1) ?? 0;

  return (
    <>
      <Reveal delay={0.1} className="flex flex-1 items-center">
        {/* `isolate`: the glow's -z-10 stays inside the sky */}
        <div ref={skyRef} className="relative isolate mx-auto h-64 w-full max-w-5xl sm:h-80 lg:h-[min(60dvh,34rem)]">
          <div
            aria-hidden
            className="absolute inset-x-[10%] inset-y-[8%] -z-10 rounded-full bg-linear-to-r from-glow-1 via-glow-2 to-glow-3 opacity-60 blur-3xl"
          />
          {DUST.map((d, i) => (
            <span
              key={i}
              aria-hidden
              style={{ left: d.left, top: d.top, animationDelay: d.delay }}
              className={`absolute rounded-full bg-foreground opacity-30 motion-safe:animate-twinkle ${d.big ? "size-1" : "size-0.5"}`}
            />
          ))}

          {size.w > 0 && (
            <svg
              aria-hidden
              className="absolute inset-0 size-full overflow-visible"
              viewBox={`0 0 ${size.w} ${size.h}`}
            >
              <polyline
                points={points}
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="3 7"
                strokeLinecap="round"
                className="stroke-foreground/30"
              />
              {/* The road so far: a dash exactly as long as the path up to the hovered star (or the last one opened);
                  changing its length animates the line along the path */}
              <polyline
                points={points}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${round(upTo[lineTo])} ${round(total + 10)}`,
                }}
                className="stroke-accent transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none"
              />
            </svg>
          )}

          <ul aria-label="Jobs, oldest to newest" onPointerLeave={() => setPreview(null)}>
            {stars.map((s, i) => {
              // Stars near the top are peaks: the path climbs into them from below, so their label sits above the
              // dot instead (visual order only; the DOM order, and so what screen readers read, stays the same)
              const above = at[i].y < 40;
              return (
                // Shifted on the <li> (the positioned box), not the button inside, or the li's unshifted box would
                // still stick out past the right edge and widen the page on phones. The shift centres the star (a
                // 40px box, 1.25rem from the top or bottom of the button) on its point.
                <li
                  key={s.company}
                  style={{ left: `${round(at[i].x)}%`, top: `${at[i].y}%` }}
                  className={`absolute -translate-x-1/2 ${above ? "-translate-y-[calc(100%-1.25rem)]" : "-translate-y-5"}`}
                >
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    data-selected={i === selected ? "" : undefined}
                    onClick={() => openJob(i)}
                    onPointerEnter={() => setPreview(i)}
                    onFocus={() => setPreview(i)}
                    onBlur={() => setPreview(null)}
                    className="group flex cursor-pointer flex-col items-center gap-1 rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <span aria-hidden className={`relative grid size-10 place-items-center ${above ? "order-3" : ""}`}>
                      <span className="absolute -inset-3 rounded-full bg-glow-1 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100 group-data-selected:opacity-100" />
                      <span className="absolute inset-0 rounded-full border border-dashed border-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-data-selected:opacity-100 motion-safe:animate-[spin_14s_linear_infinite]" />
                      <span
                        ref={(el) => {
                          dotRefs.current[i] = el;
                        }}
                        className="relative size-2.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] transition-transform duration-300 group-hover:scale-[1.7] group-data-selected:scale-[1.7]"
                      />
                    </span>
                    <span
                      className={`glass-lite rounded-full px-2.5 py-1 ${above ? "order-1" : ""} text-xs font-semibold whitespace-nowrap transition group-hover:-translate-y-0.5 group-hover:border-accent group-data-selected:border-accent sm:px-3 sm:text-sm lg:text-base`}
                    >
                      <span className="lg:hidden">{s.short}</span>
                      <span className="hidden lg:inline">{s.company}</span>
                    </span>
                    <span className={`text-xs sm:text-sm ${above ? "order-2" : ""}`}>{s.years}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>

      {/* The job popup. Full-screen and transparent itself: our own backdrop and card animate inside it
          (the native ::backdrop can't be animated out). Closed = `display: none`, but the panels are in the HTML. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(e) => {
          e.preventDefault(); // Esc: animate out first
          requestClose();
        }}
        onClose={() => setOpen(false)} // closed some other way (e.g. a second Esc the browser won't let us cancel)
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
        {/* pointer-events-none: clicks beside the card fall through to the backdrop, which closes */}
        <div className="pointer-events-none relative flex min-h-full items-center justify-center">
          <div ref={boxRef} className="pointer-events-auto w-full max-w-2xl">
            <motion.div
              variants={card}
              initial="out"
              animate={phase}
              style={{ transformOrigin: origin }}
              onAnimationComplete={(name) => {
                if (name === "out" && closing.current) setOpen(false);
              }}
            >
              <GlassWindow
                title={stars[selected].company}
                titleId={titleId}
                onClose={requestClose}
                closeLabel="Close"
                orbitDuration={22}
              >
                <div className="p-5 sm:p-7">
                  {panels.map((panel, i) => (
                    <div key={i} hidden={i !== selected}>
                      {panel}
                    </div>
                  ))}
                </div>
              </GlassWindow>
            </motion.div>
          </div>
        </div>
      </dialog>
    </>
  );
}
