"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Brushing: painted areas stay for BRUSH_HOLD_MS after the stroke ends, then fade back over BRUSH_FADE_MS
const BRUSH_HOLD_MS = 5000;
const BRUSH_FADE_MS = 2500;
// The stroke mask is drawn at this fraction of full resolution and stretched up: smoothing gives soft edges for free
const MASK_SCALE = 0.25;

type Stroke = { points: { x: number; y: number }[]; endedAt: number | null };

/**
 * Shows an illustration, and reveals the real photo:
 * - hover: a circle under the pointer (CSS mask driven by CSS variables, no React re-renders);
 * - press and drag ("brush"): the brushed areas stay revealed for 5 s after the stroke, then fade back.
 *   Drawn on a <canvas>: each frame paints the strokes (each with its own fade) into a low-res mask, then draws
 *   the photo through it with `destination-in`. The animation loop only runs while strokes are visible.
 * The whole thing is `pointer-events: none`, so clicks and drags pass through to whatever sits behind it
 * (e.g. the back of the orbit ring). It follows the pointer through window listeners instead.
 * Both images must share the exact same canvas size and framing, or the reveal won't line up.
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;

    // Strokes live in plain variables, not React state: they change ~60 times a second and nothing re-renders
    const strokes: Stroke[] = [];
    let active: Stroke | null = null;
    let frame = 0;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d")!;
    const desktop = window.matchMedia("(min-width: 1024px)");

    // Match the canvas to the box (in device pixels, capped at 2x for cost)
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const box = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      mask.width = Math.max(1, Math.round(w * MASK_SCALE));
      mask.height = Math.max(1, Math.round(h * MASK_SCALE));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const strokeAlpha = (s: Stroke, now: number) => {
      if (s.endedAt === null) return 1; // still brushing
      const age = now - s.endedAt;
      return age < BRUSH_HOLD_MS ? 1 : Math.max(0, 1 - (age - BRUSH_HOLD_MS) / BRUSH_FADE_MS);
    };

    const draw = () => {
      const now = performance.now();
      for (let i = strokes.length - 1; i >= 0; i--) if (strokeAlpha(strokes[i], now) <= 0) strokes.splice(i, 1);

      // 1) Brush strokes into the low-res mask, each with its own opacity
      mctx.clearRect(0, 0, mask.width, mask.height);
      mctx.lineCap = "round";
      mctx.lineJoin = "round";
      mctx.lineWidth = radius * 2 * MASK_SCALE;
      mctx.strokeStyle = mctx.fillStyle = "#000";
      for (const s of strokes) {
        mctx.globalAlpha = strokeAlpha(s, now);
        const [first, ...rest] = s.points;
        if (!rest.length) {
          mctx.beginPath();
          mctx.arc(first.x * MASK_SCALE, first.y * MASK_SCALE, radius * MASK_SCALE, 0, Math.PI * 2);
          mctx.fill();
          continue;
        }
        mctx.beginPath();
        mctx.moveTo(first.x * MASK_SCALE, first.y * MASK_SCALE);
        for (const p of rest) mctx.lineTo(p.x * MASK_SCALE, p.y * MASK_SCALE);
        mctx.stroke();
      }
      mctx.globalAlpha = 1;

      // 2) The photo, kept only where the mask is painted. Stretching the low-res mask up softens its edges.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const img = photoRef.current;
      if (strokes.length && img?.complete && img.naturalWidth) {
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
      }

      // Keep animating only while something is on screen
      frame = strokes.length ? requestAnimationFrame(draw) : 0;
    };
    const ensureLoop = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const hide = () => el.style.setProperty("--reveal-r", "0px");
    const localPoint = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top, inside: e.clientX >= box.left && e.clientY >= box.top && e.clientX <= box.right && e.clientY <= box.bottom };
    };

    const move = (e: PointerEvent) => {
      const p = localPoint(e);
      if (active) {
        active.points.push({ x: p.x, y: p.y });
        ensureLoop();
      }
      if (!p.inside) return hide(); // pointer is off the photo
      el.style.setProperty("--reveal-x", `${p.x}px`);
      el.style.setProperty("--reveal-y", `${p.y}px`);
      el.style.setProperty("--reveal-r", `${radius}px`);
    };
    const down = (e: PointerEvent) => {
      move(e);
      const p = localPoint(e);
      const onCard = e.target instanceof Element && e.target.closest("a, button");
      // Phones scroll on touch, so only brush with touch where the page doesn't scroll (desktop layout)
      const canBrush = e.button === 0 && (e.pointerType !== "touch" || desktop.matches);
      if (!p.inside || onCard || !canBrush) return;
      e.preventDefault(); // no text selection or native image drag while brushing
      active = { points: [{ x: p.x, y: p.y }], endedAt: null };
      strokes.push(active);
      ensureLoop();
    };
    const end = (e: PointerEvent) => {
      if (active) {
        active.endedAt = performance.now(); // its 5 s hold starts now
        active = null;
      }
      if (e.pointerType !== "mouse") hide(); // finger lifted
    };
    const leaveWindow = (e: PointerEvent) => !e.relatedTarget && hide(); // mouse left the browser window

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    document.addEventListener("pointerout", leaveWindow);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.removeEventListener("pointerout", leaveWindow);
    };
  }, [radius]);

  // Soft edge: fully opaque to 75% of the radius, fading out by the edge
  const revealMask = "radial-gradient(circle var(--reveal-r) at var(--reveal-x) var(--reveal-y), #000 75%, transparent 100%)";

  return (
    <div ref={ref} className="reveal-photo pointer-events-none absolute inset-0">
      {/* The illustration is what everyone sees first, so it's the high-priority image and carries the alt text */}
      <Image src={illustration} alt={alt} fill sizes={sizes} loading="eager" fetchPriority="high" className="object-contain object-bottom" />
      {/* Brushed areas: the photo drawn through the brush strokes (see the effect above) */}
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      {/* Hover circle. Also the image the canvas draws from, so there's no second download.
          Same subject as the illustration, so it's decorative for screen readers. */}
      <Image
        ref={photoRef}
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
