"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { CountUp } from "@/components/ui/CountUp";

export type OrbitStat = { value: number; suffix: string; label: string };

const LAP_SECONDS = 36; // one full orbit
const CENTER_Y = 0.46; // orbit centre, as a fraction of the stage height (around the chest)
const RADIUS_X = 0.5; // as a fraction of the stage width (may reach past the stage, never past the screen)
const RADIUS_Y = 0.13; // as a fraction of the stage height: a flat, tilted ring

/**
 * The stats riding a tilted orbit around the avatar on the About page. Front half (bottom of the ellipse) passes in
 * front of the avatar, back half behind it (fading as it recedes), like the home ring. It keeps orbiting on hover.
 * Positions are written straight to the DOM every frame (no React re-renders), and only in the browser: the server
 * HTML has no trig-computed styles, so server and client markup always match.
 * Must sit in the same stacking context as the avatar (the stage is `isolate`; nothing between them may create a
 * stacking context), so the bubbles' z-index (0 behind / 20 in front) interleaves with the avatar's z-10.
 */
export function AboutOrbit({ stats }: { stats: OrbitStat[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();
  const angle = useRef(0.35); // radians; start slightly turned so no bubble sits dead centre on the avatar

  const place = () => {
    const box = boxRef.current;
    if (!box) return;
    const w = box.clientWidth;
    const h = box.clientHeight;
    // Bubbles may swing outside the stage, but never off the screen (phones): only shrink the orbit when the room
    // between the stage's centre and the nearer window edge is less than the radius plus half the widest bubble
    const widest = Math.max(0, ...itemRefs.current.map((el) => el?.offsetWidth ?? 0));
    const rect = box.getBoundingClientRect();
    const room = Math.min(rect.left + w / 2, window.innerWidth - rect.left - w / 2) - widest / 2 - 8;
    const rx = Math.min(w * RADIUS_X, room);
    const ry = h * RADIUS_Y;
    const cy = h * CENTER_Y;
    if (ringRef.current) {
      ringRef.current.style.cssText = `left:${w / 2 - rx}px;top:${cy - ry}px;width:${rx * 2}px;height:${ry * 2}px`;
    }
    stats.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const t = angle.current + (i / stats.length) * Math.PI * 2;
      const depth = (Math.cos(t) + 1) / 2; // 1 = front (bottom of the ellipse), 0 = back
      el.style.transform = `translate(${w / 2 + Math.sin(t) * rx}px, ${cy + Math.cos(t) * ry}px) translate(-50%, -50%) scale(${0.82 + 0.18 * depth})`;
      el.style.zIndex = Math.cos(t) > -0.15 ? "20" : "0"; // the avatar is z-10
      el.style.opacity = String(0.45 + 0.55 * depth); // recede toward the back (safe: glass-lite has no blur)
    });
  };

  // Position before the first paint (no jump), and again whenever the stage resizes
  useLayoutEffect(() => {
    place();
    const ro = new ResizeObserver(place);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `place` only reads refs and the stable `stats`
  }, []);

  useEffect(() => {
    if (reduce) return; // reduced motion: the bubbles stay where they are
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      angle.current += (dt * Math.PI * 2) / LAP_SECONDS;
      place();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `place` only reads refs and the stable `stats`
  }, [reduce]);

  return (
    <div ref={boxRef} className="absolute inset-0">
      {/* The orbit path (behind the avatar) */}
      <div ref={ringRef} aria-hidden className="absolute rounded-full border border-dashed border-foreground/25" />
      <ul aria-label="At a glance">
        {stats.map((s, i) => (
          <li
            key={s.label}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="glass-lite absolute top-0 left-0 flex flex-col items-center rounded-2xl px-4 py-2 text-center whitespace-nowrap transition-[border-color] hover:border-accent sm:px-5 sm:py-3"
          >
            <span className="text-2xl leading-none font-semibold sm:text-3xl">
              <CountUp to={s.value} suffix={s.suffix} />
            </span>
            <span className="mt-1 text-xs sm:text-sm">{s.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
