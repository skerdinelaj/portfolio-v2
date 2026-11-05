"use client";

import { useRef, useState, type ReactNode } from "react";
import { PopupWindow } from "@/components/ui/PopupWindow";

type Letter = { slug: string; author: string; role: string; company: string; date: string; excerpt: string };

const FLOATS = ["motion-safe:animate-float", "motion-safe:animate-float-slow"];
const DELAYS = ["0s", "-3.1s"];

/**
 * The reference letters as floating glass letters (excerpt + who wrote it). Clicking one opens the whole letter in a
 * `PopupWindow` that grows out of it.
 * The whole letter is clickable, but the real control is the "Read the full letter" <button>: its ::after stretches
 * over the card. `glass-lite` (no blur): the cards move every frame.
 * `panels` (the full letters) are rendered on the server, one per letter in the same order; all stay in the HTML.
 */
export function LetterWindows({ letters, panels }: { letters: Letter[]; panels: ReactNode[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const openedRef = useRef(0);

  const openLetter = (i: number) => {
    openedRef.current = i;
    setSelected(i);
    setOpen(true);
  };

  return (
    <>
      <ul className="isolate grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-8">
        {letters.map((l, i) => (
          // The bob is on the <li>, the hover lift on the card: both use `transform`
          <li
            key={l.slug}
            style={{ animationDelay: DELAYS[i % DELAYS.length] }}
            className={`${FLOATS[i % FLOATS.length]} hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]`}
          >
            <article
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="glass-lite relative flex h-full flex-col rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-accent sm:p-7"
            >
              <p className="flex items-center justify-between gap-3 text-xs font-semibold tracking-widest uppercase">
                <span>Letter of reference</span>
                <span className="font-normal tracking-normal">{l.date}</span>
              </p>
              <blockquote className="mt-4 flex-1 text-lg leading-snug italic sm:text-xl">
                <p>&ldquo;{l.excerpt}&rdquo;</p>
              </blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-foreground/10 pt-4">
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 font-semibold"
                >
                  {l.author[0]}
                </span>
                <div className="min-w-0 text-sm">
                  <h3 className="font-semibold">{l.author}</h3>
                  <p>
                    {l.role}, {l.company}
                  </p>
                </div>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => openLetter(i)}
                  className="ml-auto shrink-0 cursor-pointer rounded-full border border-foreground/15 px-3 py-1.5 text-xs font-semibold outline-none after:absolute after:inset-0 after:z-10 after:rounded-3xl"
                >
                  Read letter<span className="sr-only"> from {l.author}</span>
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <PopupWindow
        open={open}
        title={`Letter from ${letters[selected].author}`}
        origin={() => cardRefs.current[openedRef.current]}
        onClosed={() => setOpen(false)}
      >
        <div className="p-5 sm:p-7">
          {panels.map((panel, i) => (
            <div key={i} hidden={i !== selected}>
              {panel}
            </div>
          ))}
        </div>
      </PopupWindow>
    </>
  );
}
