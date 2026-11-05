"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PopupWindow } from "@/components/ui/PopupWindow";

type Quote = { text: string; author: string; letter: number };

const LAP_SECONDS = 70; // one full orbit: slow, so a quote can be read as it passes
const CENTER_Y = 0.5; // orbit centre, as a fraction of the stage height
const RADIUS_X = 0.72; // as a fraction of the stage width (may reach past the stage, never past the screen)
const RADIUS_Y = 0.36; // as a fraction of the stage height

/**
 * The Reviews stage: lines from the reference letters riding a tilted orbit around the avatar (the About page's
 * orbit, with words instead of numbers). The front half passes in front of the avatar, the back half behind it and
 * faded. Clicking a quote opens its whole letter in a `PopupWindow` that grows out of the quote.
 * Unlike the About stats, the orbit pauses while the pointer is on a quote or a quote has keyboard focus: you can't
 * click or read a moving target.
 * Positions are written straight to the DOM every frame and only in the browser (no trig in the server HTML), and the
 * layer must share the avatar's stacking context (the stage is `isolate`) so the z-indexes interleave with it (z-10).
 * Phones get the same quotes as a plain list instead (an orbit that wide doesn't fit).
 * `panels` (the full letters) are rendered on the server, one per letter; all stay in the HTML.
 */
export function QuoteOrbit({ quotes, authors, panels }: { quotes: Quote[]; authors: string[]; panels: ReactNode[] }) {
  const [open, setOpen] = useState(false);
  const [letter, setLetter] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listRefs = useRef<(HTMLLIElement | null)[]>([]); // the phone list
  const letterRefs = useRef<(HTMLButtonElement | null)[]>([]); // the "read the letters" buttons
  const angle = useRef(0.4);
  const paused = useRef(false);
  const openedFrom = useRef<HTMLElement | null>(null); // the quote the popup grows out of (set in the click handler)
  const reduce = useReducedMotion();

  const place = () => {
    const box = boxRef.current;
    if (!box || !box.clientWidth) return; // hidden (phones, or the page hidden by <Activity>)
    const w = box.clientWidth;
    const h = box.clientHeight;
    // Quotes may swing outside the stage, but never off the screen: shrink the orbit only when the room between the
    // stage's centre and the nearer window edge is less than the radius plus half the widest quote
    const widest = Math.max(0, ...itemRefs.current.map((el) => el?.offsetWidth ?? 0));
    const rect = box.getBoundingClientRect();
    const room = Math.min(rect.left + w / 2, window.innerWidth - rect.left - w / 2) - widest / 2 - 12;
    const rx = Math.max(0, Math.min(w * RADIUS_X, room));
    const ry = h * RADIUS_Y;
    const cy = h * CENTER_Y;
    if (ringRef.current) {
      ringRef.current.style.cssText = `left:${w / 2 - rx}px;top:${cy - ry}px;width:${rx * 2}px;height:${ry * 2}px`;
    }
    quotes.forEach((_, i) => {
      const el = itemRefs.current[i];
      if (!el) return;
      const t = angle.current + (i / quotes.length) * Math.PI * 2;
      const depth = (Math.cos(t) + 1) / 2; // 1 = front (bottom of the ellipse), 0 = back
      el.style.transform = `translate(${w / 2 + Math.sin(t) * rx}px, ${cy + Math.cos(t) * ry}px) translate(-50%, -50%) scale(${0.8 + 0.2 * depth})`;
      el.style.zIndex = Math.cos(t) > -0.2 ? "20" : "0"; // the avatar is z-10
      el.style.opacity = String(0.35 + 0.65 * depth); // safe: glass-lite has no blur
    });
  };

  // Position before the first paint, and again whenever the stage resizes
  useLayoutEffect(() => {
    place();
    const ro = new ResizeObserver(place);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `place` only reads refs and the stable `quotes`
  }, []);

  useEffect(() => {
    if (reduce) return; // reduced motion: the quotes stay where they are
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!paused.current) angle.current += (dt * Math.PI * 2) / LAP_SECONDS;
      place();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `place` only reads refs and the stable `quotes`
  }, [reduce]);

  const openLetter = (q: Quote, from: HTMLElement | null) => {
    openedFrom.current = from;
    setLetter(q.letter);
    setOpen(true);
  };

  const bubble = (q: Quote) => (
    <>
      <span className="block text-sm leading-snug italic sm:text-base">&ldquo;{q.text}&rdquo;</span>
      <span className="mt-1.5 block text-xs font-semibold">· {q.author}</span>
      <span className="sr-only">: read the full letter</span>
    </>
  );
  const bubbleClass =
    "glass-lite block w-full cursor-pointer rounded-2xl px-4 py-3 text-left transition hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <>
      {/* The orbit (md and up) */}
      {/* Over the avatar's square only (not the rows below it), so the orbit stays centred on the avatar */}
      <div ref={boxRef} className="absolute inset-x-0 top-0 hidden aspect-square md:block">
        <div ref={ringRef} aria-hidden className="absolute rounded-full border border-dashed border-foreground/20" />
        <ul
          aria-label="From my reference letters"
          onPointerEnter={() => (paused.current = true)}
          onPointerLeave={() => (paused.current = false)}
          onFocus={() => (paused.current = true)}
          onBlur={() => (paused.current = false)}
        >
          {quotes.map((q, i) => (
            <li
              key={q.text}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 w-60 lg:w-64"
            >
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => openLetter(q, itemRefs.current[i])}
                className={bubbleClass}
              >
                {bubble(q)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Phones: the same quotes as a list, under the avatar (rendered by the parent's flow, see Testimonials) */}
      <ul aria-label="From my reference letters" className="relative z-20 mt-4 space-y-3 md:hidden">
        {quotes.map((q, i) => (
          <li
            key={q.text}
            ref={(el) => {
              listRefs.current[i] = el;
            }}
          >
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => openLetter(q, listRefs.current[i])}
              className={bubbleClass}
            >
              {bubble(q)}
            </button>
          </li>
        ))}
      </ul>

      {/* The letters by name: the same popups, without chasing a moving quote */}
      <div className="relative z-20 mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="mr-1 text-xs font-semibold tracking-widest uppercase">Reference letters</span>
        {authors.map((a, i) => (
          <button
            key={a}
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              openedFrom.current = letterRefs.current[i];
              setLetter(i);
              setOpen(true);
            }}
            className="glass-lite cursor-pointer rounded-full px-4 py-1.5 font-semibold transition hover:-translate-y-0.5 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {a}
          </button>
        ))}
      </div>

      <PopupWindow
        open={open}
        title={`Letter from ${authors[letter]}`}
        origin={() => openedFrom.current}
        onClosed={() => setOpen(false)}
      >
        <div className="p-5 sm:p-7">
          {panels.map((panel, i) => (
            <div key={i} hidden={i !== letter}>
              {panel}
            </div>
          ))}
        </div>
      </PopupWindow>
    </>
  );
}
