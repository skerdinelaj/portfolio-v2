"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PopupWindow } from "@/components/ui/PopupWindow";
import { Reveal } from "@/components/ui/Reveal";

type Star = { company: string; short: string; years: string };

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

/**
 * The Experience sky: one star per job, oldest → newest, joined by a dashed path; a sage line fills the path up to
 * the star under the pointer, or the last job you opened (today's job at first: "the road so far"). Clicking a star
 * opens that job in a `PopupWindow` that grows out of the star's dot and shrinks back into it.
 * `panels` are rendered on the server (one per star, same order); all stay in the HTML, the popup shows one.
 */
export function Constellation({ stars, panels }: { stars: Star[]; panels: ReactNode[] }) {
  const [selected, setSelected] = useState(stars.length - 1); // where the line stays: today's job, then the last one opened
  const [preview, setPreview] = useState<number | null>(null); // the star under the pointer / keyboard focus
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const skyRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const openedRef = useRef(0); // the star the popup belongs to (written by the click handler only)

  // The path is drawn in pixels (so dashes keep their length at any width), which needs the sky's measured size.
  // Before that (server HTML, first paint) there is simply no line yet.
  useLayoutEffect(() => {
    const el = skyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openJob = (i: number) => {
    openedRef.current = i;
    setSelected(i);
    setOpen(true);
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

      <PopupWindow
        open={open}
        title={stars[selected].company}
        origin={() => dotRefs.current[openedRef.current]}
        onClosed={() => setOpen(false)}
      >
        {/* Every job's content is here (in the HTML); only the opened one shows */}
        <div className="p-5 sm:p-7">
          {panels.map((panel, i) => (
            <div key={i} hidden={i !== selected}>
              {panel}
            </div>
          ))}
        </div>
      </PopupWindow>
    </>
  );
}
