"use client";

import { useReducedMotion } from "motion/react";
import { Children, useEffect, useRef, type ReactNode } from "react";

export type GlobeItem = { name: string; level: string; category: string };

type Vec = [number, number, number];
type Mat = [number, number, number, number, number, number, number, number, number]; // row-major 3×3

const AUTO_SPIN = 0.0035; // radians per frame around the vertical axis when idle (~30 s per turn)
const DRAG_SPEED = 0.008; // radians per pixel dragged
const FRICTION = 0.94; // how fast a flick slows back down to the idle spin
const BRAKE = 0.85; // stronger friction while the pointer is over the globe: it glides to a stop in about a second

const mul = (a: Mat, b: Mat): Mat => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
];
const rotY = (t: number): Mat => [Math.cos(t), 0, Math.sin(t), 0, 1, 0, -Math.sin(t), 0, Math.cos(t)];
const rotX = (t: number): Mat => [1, 0, 0, 0, Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t)];
const apply = (m: Mat, [x, y, z]: Vec): Vec => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];

/** Spreads n points evenly over a sphere (golden-angle spiral, a.k.a. Fibonacci sphere). */
function fibonacciSphere(n: number): Vec[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    return [Math.cos(golden * i) * r, y, Math.sin(golden * i) * r];
  });
}

/**
 * The tech icons on a spinning globe. Drag (or arrow keys) to spin it; a flick keeps spinning and eases back to the idle spin.
 * Pointing at the globe brakes it to a stop, so an icon can be read; leaving it starts the idle spin again.
 * Each frame rotates the points with one 3×3 matrix and writes transform/opacity straight to the DOM: no React re-renders.
 * `children` are the icons, rendered on the server (react-icons are functions and can't be passed as props), in `items` order.
 */
export function TechGlobe({ items, children }: { items: GlobeItem[]; children: ReactNode }) {
  const icons = Children.toArray(children);
  const boxRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = useReducedMotion();
  const keyNudge = useRef<(dx: number, dy: number) => void>(() => {});

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const points = fibonacciSphere(items.length);
    let m: Mat = rotX(-0.35); // tilted a little, like a desk globe
    let hovering = false;
    const idle = () => (reduce || hovering ? 0 : AUTO_SPIN);
    let vel = { x: idle(), y: 0 }; // radians per frame: x = around the vertical axis, y = around the horizontal axis
    let frame = 0;
    let visible = true;
    let drag: { id: number; x: number; y: number; t: number } | null = null;

    const render = () => {
      const size = box.clientWidth;
      const R = size * 0.4;
      const c = size / 2;
      // Rotate, then project (orthographic: drop z, and use z for size, fade and stacking)
      points.forEach((p, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const [x, y, z] = apply(m, p);
        const depth = (z + 1) / 2; // 1 = facing you, 0 = far side
        el.style.transform = `translate(${c + x * R}px, ${c + y * R}px) translate(-50%, -50%) scale(${0.55 + 0.45 * depth})`;
        el.style.opacity = String(0.3 + 0.7 * depth);
        el.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = () => {
      if (!drag) {
        m = mul(mul(rotY(vel.x), rotX(-vel.y)), m);
        const f = hovering ? BRAKE : FRICTION;
        vel = { x: idle() + (vel.x - idle()) * f, y: vel.y * f };
      }
      render();
      const moving = drag || Math.abs(vel.x) > 1e-5 || Math.abs(vel.y) > 1e-5;
      frame = visible && moving ? requestAnimationFrame(tick) : 0; // fully stopped (hover / reduced motion): no loop at all
    };
    const start = () => {
      if (!frame && visible) frame = requestAnimationFrame(tick);
    };

    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
      start(); // the loop may have stopped while it was held still
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      box.setPointerCapture(e.pointerId);
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
      vel = { x: 0, y: 0 };
      start();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const now = performance.now();
      const frames = Math.max(1, (now - drag.t) / 16.7);
      // Drag right turns the front to the right; drag down tips the top toward you
      m = mul(mul(rotY(dx * DRAG_SPEED), rotX(-dy * DRAG_SPEED)), m);
      vel = { x: (dx * DRAG_SPEED) / frames, y: (dy * DRAG_SPEED) / frames };
      drag = { id: drag.id, x: e.clientX, y: e.clientY, t: now };
    };
    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (performance.now() - drag.t > 80) vel = { x: 0, y: 0 }; // held still before letting go: no flick
      drag = null;
      start();
    };
    keyNudge.current = (dx, dy) => {
      vel = { x: vel.x + dx, y: vel.y + dy };
      start();
    };

    render();
    start();
    const ro = new ResizeObserver(render);
    ro.observe(box);
    // Don't spend frames on a globe that's scrolled off screen
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(box);

    box.addEventListener("pointerenter", onEnter);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerup", onUp);
    box.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      box.removeEventListener("pointerenter", onEnter);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerup", onUp);
      box.removeEventListener("pointercancel", onUp);
    };
  }, [items.length, reduce]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const k = 0.06;
    const nudge = { ArrowLeft: [-k, 0], ArrowRight: [k, 0], ArrowUp: [0, -k], ArrowDown: [0, k] }[e.key];
    if (!nudge) return;
    e.preventDefault();
    keyNudge.current(nudge[0], nudge[1]);
  };

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      role="group"
      aria-label="Tech globe. Drag or use the arrow keys to spin it."
      onKeyDown={onKeyDown}
      // As big as the space under the header allows (height minus the 3.5rem header, or width), with a small margin.
      // touch-pan-y: on phones a vertical swipe still scrolls the page, a sideways swipe spins the globe.
      // isolate: the icons' z-index (up to 100, for depth) only orders them among themselves, so they can't rise
      // above things outside the globe, like the contact popup (z-70).
      className="relative isolate aspect-square w-[min(calc(100dvh-5.5rem),calc(100vw-2rem))] cursor-grab touch-pan-y select-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:cursor-grabbing"
    >
      {/* Soft light inside the globe, same glow as behind the avatar (sun / moon) */}
      <div aria-hidden className="absolute inset-[10%] rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-60 blur-2xl" />
      <ul aria-label="Technologies">
        {items.map((item, i) => (
          <li
            key={item.name}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            // glass-lite: the glass look without the background blur (17 bubbles move every frame; re-blurring would be costly)
              className="glass-lite absolute top-0 left-0 grid size-16 place-items-center rounded-full text-foreground transition-[border-color] will-change-transform hover:border-accent sm:size-20"
          >
            {icons[i]}
            <span className="sr-only">
              {item.name}, {item.level}, {item.category}
            </span>
          </li>
        ))}
    </ul>
    </div>
  );
}
