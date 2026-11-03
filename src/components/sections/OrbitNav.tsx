"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

/** Plain data only: this is a Client Component, so no icon components in props. */
export type OrbitPage = { href: string; label: string; teaser: string };

// Ring geometry, as fractions of the container: centre height, horizontal radius, vertical (tilt) radius
const CENTER_Y = 0.5;
const RADIUS_X = 0.42;
const RADIUS_Y = 0.37;
const MAX_RADIUS_X = 640;
// One gesture = one step. Trackpads send many small wheel events with momentum, so lock briefly after a step.
const WHEEL_THRESHOLD = 30;
const STEP_LOCK_MS = 550;

const mod = (n: number, m: number) => ((n % m) + m) % m;

function OrbitItem({
  page,
  index,
  step,
  angle,
  size,
  isFront,
  onFocus,
}: {
  page: OrbitPage;
  index: number;
  step: number;
  angle: MotionValue<number>;
  size: { w: number; h: number };
  isFront: boolean;
  onFocus: () => void;
}) {
  // Item i sits `i` steps to the left of the front; the whole ring turns by `angle` degrees
  const rad = useTransform(angle, (a) => ((a - index * step) * Math.PI) / 180);
  const rx = Math.min(size.w * RADIUS_X, MAX_RADIUS_X);
  const x = useTransform(rad, (r) => Math.sin(r) * rx);
  const y = useTransform(rad, (r) => size.h * CENTER_Y + Math.cos(r) * size.h * RADIUS_Y);
  const depth = useTransform(rad, (r) => (Math.cos(r) + 1) / 2); // 1 = front, 0 = back
  const scale = useTransform(depth, (d) => 0.7 + 0.3 * d);
  const opacity = useTransform(depth, (d) => 0.3 + 0.7 * d);
  // Front half passes in front of the photo and name; back half goes behind the photo (negative z, still above the page background)
  const zIndex = useTransform(rad, (r) => (Math.cos(r) > -0.2 ? 30 : -1));

  return (
    <motion.div className="absolute top-0 left-1/2" style={{ x, y, scale, opacity, zIndex }}>
      <Link
        href={page.href}
        onFocus={onFocus}
        aria-current={isFront ? "true" : undefined}
        className={`group flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl bg-surface/90 px-5 py-3 text-center whitespace-nowrap shadow-lg ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
          isFront ? "ring-accent" : "ring-border hover:ring-accent"
        }`}
      >
        <span className="font-mono text-sm font-bold text-accent">{String(index + 1).padStart(2, "0")}</span>
        {isFront && <span className="mt-1 font-mono text-xs text-muted">{page.teaser}</span>}
        <span className="text-2xl font-medium tracking-tight transition-colors group-hover:text-accent xl:text-3xl">{page.label}</span>
        {isFront && (
          <span className="mt-2 inline-flex items-center gap-1.5 bg-accent px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-white dark:text-background">
            Enter <FiArrowRight className="size-3" aria-hidden />
          </span>
        )}
      </Link>
    </motion.div>
  );
}

/**
 * Desktop home navigation: the pages ride a tilted ring around the photo.
 * Wheel / trackpad / swipe / arrow keys turn it one page at a time; the front page is highlighted.
 */
export function OrbitNav({ pages }: { pages: OrbitPage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const step = 360 / pages.length;
  const [turns, setTurns] = useState(0); // total steps taken; unbounded so the ring never jumps when wrapping
  const [size, setSize] = useState({ w: 0, h: 0 });
  const angle = useMotionValue(0);
  const front = mod(turns, pages.length);

  // Spring the ring to its new position
  useEffect(() => {
    const target = turns * step;
    if (reduce) {
      angle.set(target);
      return;
    }
    const controls = animate(angle, target, { type: "spring", stiffness: 140, damping: 18 });
    return () => controls.stop();
  }, [turns, step, angle, reduce]);

  // Track container size for the ring radii
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Wheel, trackpad and touch swipes anywhere on the page (desktop layout only)
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let acc = 0;
    let lockedUntil = 0;
    let touchY: number | null = null;

    const turn = (dir: 1 | -1) => {
      const now = performance.now();
      if (now < lockedUntil) return;
      lockedUntil = now + STEP_LOCK_MS;
      acc = 0;
      setTurns((t) => t + dir);
    };
    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return; // ctrl+wheel is pinch-zoom: leave it alone
      // The page doesn't scroll on desktop, but Safari still rubber-bands it on a trackpad swipe. The ring owns the gesture.
      e.preventDefault();
      if (performance.now() < lockedUntil) return; // swallow trackpad momentum
      acc += Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(acc) >= WHEEL_THRESHOLD) turn(acc > 0 ? 1 : -1);
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    // Same for touch (e.g. iPad in landscape): stop the page from bouncing while swiping the ring
    const onTouchMove = (e: TouchEvent) => desktop.matches && e.touches.length === 1 && e.preventDefault();
    const onTouchEnd = (e: TouchEvent) => {
      if (!desktop.matches || touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) turn(dy > 0 ? 1 : -1);
      touchY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Bring a page to the front by the shortest way round
  const focusPage = (i: number) => {
    setTurns((t) => {
      let diff = mod(i - t, pages.length);
      if (diff > pages.length / 2) diff -= pages.length;
      return t + diff;
    });
  };

  return (
    <nav
      ref={ref}
      aria-label="Pages"
      data-orbit-nav // globals.css turns off page overscroll (Safari bounce) on desktop while this is on the page
      className="pointer-events-none absolute inset-0 hidden lg:block"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setTurns((t) => t + 1);
        if (e.key === "ArrowLeft") setTurns((t) => t - 1);
      }}
    >
      {size.w > 0 && (
        <div className="pointer-events-auto">
          {pages.map((page, i) => (
            <OrbitItem
              key={page.href}
              page={page}
              index={i}
              step={step}
              angle={angle}
              size={size}
              isFront={i === front}
              onFocus={() => focusPage(i)}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-auto absolute right-12 bottom-8 z-40 flex items-center gap-3 font-mono text-xs text-muted">
        <span>Scroll to explore</span>
        <button type="button" onClick={() => setTurns((t) => t - 1)} aria-label="Previous page" className="grid size-8 place-items-center rounded-full border border-border bg-surface transition hover:border-accent hover:text-accent">
          <FiChevronLeft className="size-4" />
        </button>
        <span className="tabular-nums" aria-live="polite">
          {String(front + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => setTurns((t) => t + 1)} aria-label="Next page" className="grid size-8 place-items-center rounded-full border border-border bg-surface transition hover:border-accent hover:text-accent">
          <FiChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
