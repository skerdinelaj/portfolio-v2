"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Shows an illustration, and reveals the real photo in a circle under the pointer.
 * Position and radius live in CSS variables set from pointer events, so moving never re-renders React.
 * The whole thing is `pointer-events: none`, so clicks and drags pass through to whatever sits behind it
 * (e.g. the back of the orbit ring). It follows the pointer through window listeners instead.
 * Both images must share the exact same canvas size and framing, or the revealed circle won't line up.
 */
export function PhotoReveal({
  photo,
  illustration,
  alt,
  radius = 60,
  sizes,
}: {
  photo: string;
  /** The visible image. Same canvas size and framing as `photo`. */
  illustration: string;
  alt: string;
  radius?: number;
  sizes: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const hide = () => el.style.setProperty("--reveal-r", "0px");
    const move = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      if (x < 0 || y < 0 || x > box.width || y > box.height) return hide(); // pointer is off the photo
      el.style.setProperty("--reveal-x", `${x}px`);
      el.style.setProperty("--reveal-y", `${y}px`);
      el.style.setProperty("--reveal-r", `${radius}px`);
    };
    const end = (e: PointerEvent) => e.pointerType !== "mouse" && hide(); // finger lifted
    const leaveWindow = (e: PointerEvent) => !e.relatedTarget && hide(); // mouse left the browser window

    window.addEventListener("pointerdown", move);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", hide);
    document.addEventListener("pointerout", leaveWindow);
    return () => {
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", hide);
      document.removeEventListener("pointerout", leaveWindow);
    };
  }, [radius]);

  // Soft edge: fully opaque to 75% of the radius, fading out by the edge
  const revealMask = "radial-gradient(circle var(--reveal-r) at var(--reveal-x) var(--reveal-y), #000 75%, transparent 100%)";

  return (
    <div ref={ref} className="reveal-photo pointer-events-none absolute inset-0">
      {/* The illustration is what everyone sees first, so it's the high-priority image and carries the alt text */}
      <Image src={illustration} alt={alt} fill sizes={sizes} loading="eager" fetchPriority="high" className="object-contain object-bottom" />
      {/* The photo only shows through the circle: same subject, so it's decorative for screen readers */}
      <Image
        src={photo}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        loading="eager"
        className="object-contain object-bottom"
        style={{ maskImage: revealMask, WebkitMaskImage: revealMask }}
      />
    </div>
  );
}
