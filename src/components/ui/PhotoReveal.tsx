"use client";

import Image from "next/image";
import { useRef } from "react";

/**
 * Shows a line drawing, and reveals the real photo in a small circle under the pointer.
 * Position and radius live in CSS variables set from pointer events, so moving never re-renders React.
 * The drawing is a CSS mask filled with the theme's text colour, so it suits light and dark mode.
 */
export function PhotoReveal({
  photo,
  drawing,
  alt,
  radius = 60,
  sizes,
}: {
  photo: string;
  /** Ink-only image: transparent everywhere except the lines. Same size and framing as `photo`. */
  drawing: string;
  alt: string;
  radius?: number;
  sizes: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--reveal-x", `${e.clientX - box.left}px`);
    el.style.setProperty("--reveal-y", `${e.clientY - box.top}px`);
    el.style.setProperty("--reveal-r", `${radius}px`);
  };
  const hide = () => ref.current?.style.setProperty("--reveal-r", "0px");

  const drawingMask = `url(${drawing}) center / 100% 100% no-repeat`;
  // Soft edge: fully opaque to 75% of the radius, fading out by the edge
  const revealMask = "radial-gradient(circle var(--reveal-r) at var(--reveal-x) var(--reveal-y), #000 75%, transparent 100%)";

  return (
    <div
      ref={ref}
      onPointerDown={move}
      onPointerMove={move}
      onPointerLeave={hide}
      onPointerUp={(e) => e.pointerType !== "mouse" && hide()}
      onPointerCancel={hide}
      // pan-y: a vertical swipe on a phone still scrolls the page instead of being captured here
      className="reveal-photo absolute inset-0 touch-pan-y"
    >
      <div className="absolute inset-0 bg-foreground" style={{ mask: drawingMask, WebkitMask: drawingMask }} aria-hidden />
      <Image
        src={photo}
        alt={alt}
        fill
        sizes={sizes}
        loading="eager"
        className="object-contain object-bottom"
        style={{ maskImage: revealMask, WebkitMaskImage: revealMask }}
      />
    </div>
  );
}
