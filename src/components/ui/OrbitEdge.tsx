"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A dashed orbit line just outside its parent's border, with a small sage dot travelling along it: the site's orbit
 * motif (home ring, menu, SN dots, globe) on a card. The parent must be `relative`.
 * The path is a rounded rectangle sized to the parent (ResizeObserver). The dashed line is an SVG <path>; the dot is a
 * small element moved along the same path with CSS motion path (`offset-path: path(...)` + `offset-distance`).
 * (SVG <animateMotion> was tried first: inside the home ring's constantly transformed cards Chrome never painted it.)
 * Reduced motion: `motion-safe:` leaves the dot parked at the start of the path.
 */
export function OrbitEdge({ radius = 30, duration = 16 }: { radius?: number; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  let path = "";
  if (size) {
    const { w, h } = size;
    const r = Math.min(radius, w / 2, h / 2);
    // Clockwise from the top-left corner's end
    path = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  }

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute -inset-2">
      {size && (
        <svg width={size.w} height={size.h} className="absolute inset-0 overflow-visible text-foreground">
          <path d={path} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeDasharray="1.5 7" strokeLinecap="round" />
        </svg>
      )}
      {size && (
        <span
          className="absolute top-0 left-0 size-[7px] rounded-full bg-accent motion-safe:animate-orbit-edge"
          style={{ offsetPath: `path("${path}")`, offsetRotate: "0deg", animationDuration: `${duration}s` }}
        />
      )}
    </div>
  );
}
