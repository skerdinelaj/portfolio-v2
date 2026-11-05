"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// Brushing: painted areas stay for BRUSH_HOLD_MS after the stroke ends, then fade back over BRUSH_FADE_MS
const BRUSH_HOLD_MS = 5000;
const BRUSH_FADE_MS = 2500;
// The reveal mask is drawn at this fraction of full resolution and stretched up: smoothing gives soft edges for free
const MASK_SCALE = 0.25;
// How fast the hover circle grows / shrinks (time constant of an ease-out, ~180 ms to settle)
const HOVER_EASE_MS = 50;

type Stroke = { points: { x: number; y: number }[]; endedAt: number | null };

/**
 * Shows an illustration, and swaps it for the real photo where you reveal it, like a scratch card:
 * - hover: a circle under the pointer;
 * - press and drag ("brush"): the brushed areas stay revealed for 5 s after the stroke, then fade back.
 * Revealed areas ERASE the illustration (it doesn't stay visible around the photo where the drawing is wider than
 * the real outline). While anything is revealed, a <canvas> draws the whole picture:
 *   1. hover circle + strokes (each with its own fade) into a low-res mask;
 *   2. the photo kept only inside the mask (`destination-in`), on a scratch layer;
 *   3. the illustration with the mask cut out (`destination-out`), then the photo layer on top.
 * Meanwhile the illustration <img> is hidden (`data-active`). When nothing is revealed, the loop stops, the canvas is
 * cleared and the plain <img> shows again (it stays the high-priority image with the alt text).
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
  const illustrationRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    const layer = document.createElement("canvas"); // scratch layer for "photo inside the mask"
    const lctx = layer.getContext("2d");
    if (!el || !canvas || !ctx || !mctx || !lctx) return;

    // Strokes and the hover circle live in plain variables, not React state: they change ~60 times a second
    const strokes: Stroke[] = [];
    let active: Stroke | null = null;
    let frame = 0;
    let last = 0;
    const hover = { x: 0, y: 0, r: 0, target: 0 };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Match the canvases to the box (in device pixels, capped at 2x for cost)
    let w = 0;
    let h = 0;
    const resize = () => {
      const box = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = layer.width = Math.max(1, Math.round(w * dpr));
      canvas.height = layer.height = Math.max(1, Math.round(h * dpr));
      mask.width = Math.max(1, Math.round(w * MASK_SCALE));
      mask.height = Math.max(1, Math.round(h * MASK_SCALE));
      if (frame === 0) idle(); // a resize clears the canvas; make sure the <img> is the one showing
    };

    const ready = (img: HTMLImageElement | null): img is HTMLImageElement => !!img?.complete && !!img.naturalWidth;

    const strokeAlpha = (s: Stroke, now: number) => {
      if (s.endedAt === null) return 1; // still brushing
      const age = now - s.endedAt;
      return age < BRUSH_HOLD_MS ? 1 : Math.max(0, 1 - (age - BRUSH_HOLD_MS) / BRUSH_FADE_MS);
    };

    // Nothing revealed: plain <img>, empty canvas, no loop
    const idle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      delete el.dataset.active;
      frame = 0;
    };

    const draw = (now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      for (let i = strokes.length - 1; i >= 0; i--) if (strokeAlpha(strokes[i], now) <= 0) strokes.splice(i, 1);

      // Ease the hover circle toward its target size (instant with reduced motion)
      const k = reduce.matches ? 1 : 1 - Math.exp(-dt / HOVER_EASE_MS);
      hover.r += (hover.target - hover.r) * k;
      if (Math.abs(hover.target - hover.r) < 0.5) hover.r = hover.target;

      const pic = illustrationRef.current;
      const img = photoRef.current;
      if ((!strokes.length && hover.r === 0) || !ready(pic) || !ready(img)) {
        last = 0;
        return idle();
      }

      // 1) The mask: hover circle (soft edge from 75% of the radius) + brush strokes
      const s = MASK_SCALE;
      mctx.clearRect(0, 0, mask.width, mask.height);
      if (hover.r > 0) {
        const g = mctx.createRadialGradient(hover.x * s, hover.y * s, 0, hover.x * s, hover.y * s, hover.r * s);
        g.addColorStop(0.75, "#000");
        g.addColorStop(1, "rgba(0,0,0,0)");
        mctx.fillStyle = g;
        mctx.fillRect(0, 0, mask.width, mask.height);
      }
      mctx.lineCap = "round";
      mctx.lineJoin = "round";
      mctx.lineWidth = radius * 2 * s;
      mctx.strokeStyle = mctx.fillStyle = "#000";
      for (const st of strokes) {
        mctx.globalAlpha = strokeAlpha(st, now);
        const [first, ...rest] = st.points;
        mctx.beginPath();
        if (!rest.length) {
          mctx.arc(first.x * s, first.y * s, radius * s, 0, Math.PI * 2);
          mctx.fill();
          continue;
        }
        mctx.moveTo(first.x * s, first.y * s);
        for (const p of rest) mctx.lineTo(p.x * s, p.y * s);
        mctx.stroke();
      }
      mctx.globalAlpha = 1;

      // 2) Photo, kept only inside the mask. Stretching the low-res mask up softens its edges.
      for (const c of [ctx, lctx]) {
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = "high";
      }
      lctx.globalCompositeOperation = "source-over";
      lctx.clearRect(0, 0, layer.width, layer.height);
      lctx.drawImage(img, 0, 0, layer.width, layer.height);
      lctx.globalCompositeOperation = "destination-in";
      lctx.drawImage(mask, 0, 0, layer.width, layer.height);

      // 3) Illustration with the mask erased, then the photo layer on top
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(pic, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "destination-out";
      ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(layer, 0, 0);

      // Hide the <img> in the same frame the canvas first paints, so there's no flash of both or neither
      el.dataset.active = "";
      frame = requestAnimationFrame(draw);
    };
    const ensureLoop = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const hide = () => {
      hover.target = 0;
      ensureLoop();
    };
    const localPoint = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      return { x: e.clientX - box.left, y: e.clientY - box.top, inside: e.clientX >= box.left && e.clientY >= box.top && e.clientX <= box.right && e.clientY <= box.bottom };
    };

    const move = (e: PointerEvent) => {
      const p = localPoint(e);
      if (active) active.points.push({ x: p.x, y: p.y });
      if (!p.inside) return hide(); // pointer is off the photo
      hover.x = p.x;
      hover.y = p.y;
      hover.target = radius;
      ensureLoop();
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
      idle();
      ro.disconnect();
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      document.removeEventListener("pointerout", leaveWindow);
    };
  }, [radius]);

  return (
    <div ref={ref} className="reveal-photo group pointer-events-none absolute inset-0">
      {/* The illustration is what everyone sees first, so it's the high-priority image and carries the alt text.
          Hidden while the canvas draws the revealed version of it (data-active). */}
      <Image
        ref={illustrationRef}
        src={illustration}
        alt={alt}
        fill
        sizes={sizes}
        loading="eager"
        fetchPriority="high"
        className="object-contain object-bottom group-data-active:opacity-0"
      />
      {/* The revealed picture: illustration with holes + the photo inside them (see the effect above) */}
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      {/* Never shown itself: it's the source the canvas draws the photo from (loaded eagerly so the first hover is
          instant). Same subject as the illustration, so it's decorative for screen readers. */}
      <Image ref={photoRef} src={photo} alt="" aria-hidden fill sizes={sizes} loading="eager" className="invisible object-contain object-bottom" />
    </div>
  );
}
