"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type PanInfo } from "motion/react";
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
// One gesture = one step. A trackpad swipe is ~1-2s of wheel events: finger movement, then fading momentum.
const WHEEL_THRESHOLD = 30; // wheel delta needed to take a step
const GESTURE_GAP_MS = 200; // after a step: this long without wheel events = that swipe (incl. momentum) is over
const ACCUMULATE_MS = 1000; // before a step: slow swipes send sparse events, so keep adding them up across pauses this long
const NEW_SWIPE_MIN_MS = 250; // a "new swipe" can't be detected sooner than this after a step
const NEW_SWIPE_JUMP = 2; // momentum only fades; a delta this many times bigger than the last one is a fresh swipe
// Dragging: how far (in seconds of motion) a release "throws" the ring, like a dial with momentum
const FLICK_SECONDS = 0.2;
const SPRING = { type: "spring", stiffness: 140, damping: 18 } as const;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const ringRadiusX = (w: number) => Math.min(w * RADIUS_X, MAX_RADIUS_X);

const mod = (n: number, m: number) => ((n % m) + m) % m;
type Point = { x: number; y: number };

/**
 * Where card `index` sits on the ring, in radians (0 = front). Page i is i steps to the RIGHT of the front,
 * so "next" (angle + step) moves every card left and brings the next number in from the right: 01 → 02 → 03.
 * Note dθ/d(angle) = −1: turning the ring by +x° moves each card by −x° along it.
 */
const cardTheta = (index: number, step: number, angleDeg: number) => ((index * step - angleDeg) * Math.PI) / 180;

function OrbitItem({
  page,
  index,
  step,
  angle,
  size,
  isFront,
  onFocus,
  onDragStart,
  onDrag,
  onDragEnd,
  wasDragged,
}: {
  page: OrbitPage;
  index: number;
  step: number;
  angle: MotionValue<number>;
  size: { w: number; h: number };
  isFront: boolean;
  onFocus: () => void;
  onDragStart: (index: number) => void;
  onDrag: (delta: Point) => void;
  onDragEnd: (velocity: Point) => void;
  /** True if the press that just ended was a drag, so its click must not open the page */
  wasDragged: () => boolean;
}) {
  // Item i sits `i` steps to the right of the front (see cardTheta); the whole ring turns by `angle` degrees
  const rad = useTransform(angle, (a) => cardTheta(index, step, a));
  const rx = ringRadiusX(size.w);
  const x = useTransform(rad, (r) => Math.sin(r) * rx);
  // Plus: the front of the ring (cos = 1) is at the bottom, below the name; the back passes behind the head
  const y = useTransform(rad, (r) => size.h * CENTER_Y + Math.cos(r) * size.h * RADIUS_Y);
  const depth = useTransform(rad, (r) => (Math.cos(r) + 1) / 2); // 1 = front, 0 = back
  const scale = useTransform(depth, (d) => 0.7 + 0.3 * d);
  const opacity = useTransform(depth, (d) => 0.3 + 0.7 * d);
  // Front half passes in front of the photo and name; back half goes behind the photo (negative z, still above the page background)
  const zIndex = useTransform(rad, (r) => (Math.cos(r) > -0.2 ? 30 : -1));
  // The card straight behind the head (cos ≈ -1) can't be grabbed or clicked: presses pass through to the photo.
  // It stays in the tab order, and keyboard focus still turns it to the front.
  const pointerEvents = useTransform(rad, (r) => (Math.cos(r) < -0.75 ? "none" : "auto"));

  return (
    <motion.div
      // Centring lives here, on the same element as `scale`: if it were on the link inside, shrinking a card
      // toward the back would also slide it sideways off its point on the ring
      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      // touch-action none: on touch screens the finger drags the ring instead of scrolling/zooming the page
      style={{ x, y, scale, opacity, zIndex, pointerEvents, touchAction: "none" }}
      // Pan = "the pointer moved past a few px while pressed". It reports movement and velocity but moves nothing itself.
      onPanStart={() => onDragStart(index)}
      onPan={(_: PointerEvent, info: PanInfo) => onDrag(info.delta)}
      onPanEnd={(_: PointerEvent, info: PanInfo) => onDragEnd(info.velocity)}
    >
      <Link
        href={page.href}
        // Keyboard focus only: Chrome also focuses a link on mouse press, which would rotate a side card to the
        // front mid-click and let that click through. :focus-visible is set for keyboard focus, not mouse focus.
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && onFocus()}
        draggable={false} // the browser's own link drag (to the address bar) would steal the gesture
        onClickCapture={(e) => {
          // Cancel the navigation when:
          // - the press was a drag (releasing a drag fires a click too), or
          // - it's a pointer click on a card that isn't at the front: only the front card opens its page.
          //   Keyboard "clicks" (Enter) have detail 0 and still work: tabbing to a card brings it to the front first.
          const pointerClick = e.detail > 0;
          if (wasDragged() || (pointerClick && !isFront)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        aria-current={isFront ? "true" : undefined}
        className={`group flex flex-col items-center rounded-2xl bg-surface/90 px-5 py-3 text-center whitespace-nowrap shadow-lg ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:cursor-grabbing ${
          isFront ? "ring-accent" : "cursor-grab ring-border"
        }`}
      >
        <span className="text-sm font-bold text-foreground">{String(index + 1).padStart(2, "0")}</span>
        {isFront && <span className="mt-1 text-xs text-foreground">{page.teaser}</span>}
        <span className="text-2xl font-medium tracking-tight transition-colors xl:text-3xl">{page.label}</span>
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
 * Wheel / trackpad / swipe / arrow keys turn it one page at a time; dragging a card turns it freely and snaps
 * to the nearest page on release. The front page is highlighted.
 */
export function OrbitNav({ pages }: { pages: OrbitPage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const step = 360 / pages.length;
  const [turns, setTurns] = useState(0); // total steps taken; unbounded so the ring never jumps when wrapping
  const [size, setSize] = useState({ w: 0, h: 0 });
  const angle = useMotionValue(0);
  const front = mod(turns, pages.length);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  // Drag gesture state. A ref, not state: it changes on every pointer move and nothing renders from it.
  const drag = useRef<{ active: boolean; moved: boolean; index: number; mode: "follow" | "dial" }>({
    active: false,
    moved: false,
    index: 0,
    mode: "follow",
  });

  /**
   * How many degrees to turn the ring so the grabbed card follows a pointer movement `d` (px).
   * A card sits at p(θ) = (rx·sin θ, cy + ry·cos θ). The ring's direction there is the tangent
   * t = dp/dθ = (rx·cos θ, −ry·sin θ). The turn that keeps the card closest to the pointer is the projection
   * dθ = (d · t) / |t|²: horizontal drags count at the front/back, vertical drags at the sides, and the
   * direction follows the card's real path everywhere. |t| ≥ min(rx, ry) > 0, so it never blows up.
   */
  const dragToDegrees = (d: Point) => {
    // Back-left / back-right cards turn like a dial: the left/right part of the drag turns the ring exactly as a
    // front drag would (user's choice; following the path felt reversed there)
    // Both branches work out the card's move along the ring (dθ) in screen terms; the ring angle moves by −dθ
    // (cardTheta), hence the minus signs. On screen everything behaves exactly as before the order was reversed.
    if (drag.current.mode === "dial") return -toDeg(d.x / ringRadiusX(size.w)); // drag right = front cards move right
    const theta = cardTheta(drag.current.index, step, angle.get());
    const tx = ringRadiusX(size.w) * Math.cos(theta);
    const ty = -size.h * RADIUS_Y * Math.sin(theta);
    return -toDeg((d.x * tx + d.y * ty) / (tx * tx + ty * ty));
  };

  // Spring the ring to its new position
  useEffect(() => {
    const target = turns * step;
    if (reduce) {
      angle.set(target);
      return;
    }
    // Starts from the current value and velocity, so a release mid-drag flows straight into the spring
    animation.current = animate(angle, target, SPRING);
    return () => animation.current?.stop();
  }, [turns, step, angle, reduce]);

  const onDragStart = (index: number) => {
    animation.current?.stop(); // grab the ring where it is, even mid-spin
    // Which behaviour, decided once at grab time so it can't switch mid-drag (see dragToDegrees):
    // front half and the card straight behind the head follow the pointer; the back-left/right slots are a dial
    const cos = Math.cos(cardTheta(index, step, angle.get()));
    const backSide = cos < -0.2 && cos > -0.75; // the two back slots sit at cos = -0.5; straight back (-1) can't be grabbed
    drag.current = { active: true, moved: true, index, mode: backSide ? "dial" : "follow" };
  };
  const onDrag = (delta: Point) => angle.set(angle.get() + dragToDegrees(delta));
  const onDragEnd = (velocity: Point) => {
    drag.current.active = false;
    // Project where a flick would carry the ring (same projection, applied to the release velocity), then snap
    const thrown = angle.get() + dragToDegrees({ x: velocity.x * FLICK_SECONDS, y: velocity.y * FLICK_SECONDS });
    const target = Math.round(thrown / step);
    if (target === turns) {
      // Same page as before: the effect won't re-run, so spring back here
      animation.current = reduce ? null : animate(angle, target * step, SPRING);
      if (reduce) angle.set(target * step);
    } else {
      setTurns(target);
    }
  };

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
    let acc = 0; // wheel delta summed within the current gesture, until it reaches the threshold
    let stepped = false; // this gesture already took its step
    let lastEventAt = 0;
    let lastMagnitude = 0;
    let lastStepAt = 0;
    let touchY: number | null = null;

    const turn = (dir: 1 | -1) => setTurns((t) => t + dir);

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return; // ctrl+wheel is pinch-zoom: leave it alone
      // The page doesn't scroll on desktop, but Safari still rubber-bands it on a trackpad swipe. The ring owns the gesture.
      e.preventDefault();
      if (drag.current.active) return; // a card is being dragged: it owns the ring

      const now = performance.now();
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const magnitude = Math.abs(delta);

      const idle = now - lastEventAt;
      if (stepped) {
        // Unlock when the swipe that stepped is over (momentum stopped), or a new swipe starts during its momentum:
        // momentum only fades, so a delta that suddenly jumps up is a fresh swipe
        const freshSwipe = now - lastStepAt > NEW_SWIPE_MIN_MS && magnitude > 15 && magnitude > lastMagnitude * NEW_SWIPE_JUMP;
        if (idle > GESTURE_GAP_MS || freshSwipe) {
          stepped = false;
          acc = 0;
        }
      } else if (idle > ACCUMULATE_MS || (acc !== 0 && Math.sign(delta) !== Math.sign(acc))) {
        acc = 0; // a long pause or a change of direction starts the count again
      }
      lastEventAt = now;
      lastMagnitude = magnitude;

      if (stepped) return; // the rest of this gesture is momentum: ignore it
      acc += delta;
      if (Math.abs(acc) >= WHEEL_THRESHOLD) {
        stepped = true;
        lastStepAt = now;
        turn(acc > 0 ? 1 : -1);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      drag.current.moved = false; // a new touch starts clean; dragging a card sets this again
    };
    // Same for touch (e.g. iPad in landscape): stop the page from bouncing while swiping the ring
    const onTouchMove = (e: TouchEvent) => desktop.matches && e.touches.length === 1 && e.preventDefault();
    const onTouchEnd = (e: TouchEvent) => {
      if (!desktop.matches || touchY === null) return;
      if (drag.current.moved) return (touchY = null); // that touch dragged a card, not a swipe
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
        <div className="pointer-events-auto" onPointerDownCapture={() => (drag.current.moved = false)}>
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
              onDragStart={onDragStart}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              wasDragged={() => drag.current.moved}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-auto absolute right-12 bottom-8 z-40 flex items-center gap-3 text-xs text-foreground">
        <span>Scroll or drag to explore</span>
        <button type="button" onClick={() => setTurns((t) => t - 1)} aria-label="Previous page" className="grid size-8 place-items-center rounded-full border border-border bg-surface transition hover:border-accent">
          <FiChevronLeft className="size-4" />
        </button>
        <span className="tabular-nums" aria-live="polite">
          {String(front + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => setTurns((t) => t + 1)} aria-label="Next page" className="grid size-8 place-items-center rounded-full border border-border bg-surface transition hover:border-accent">
          <FiChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
