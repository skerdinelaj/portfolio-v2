"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Bird } from "@/components/ui/Bird";
import { PopupWindow } from "@/components/ui/PopupWindow";

type Kind = "work" | "learning";
type Card = { slug: string; title: string; company?: string; summary: string; image?: string; kind: Kind };

const TABS: { kind: Kind; label: string }[] = [
  { kind: "work", label: "Work" },
  { kind: "learning", label: "Learning" },
];
// Two bob speeds and staggered start points, so neighbouring windows never move in step
const FLOATS = ["motion-safe:animate-float", "motion-safe:animate-float-slow"];
const DELAYS = ["0s", "-2.4s", "-4.1s", "-1.3s", "-5.2s", "-3.3s", "-0.7s", "-4.6s"];

/**
 * The Projects desk: a Work / Learning switch (ARIA tabs), then one small floating window per project of that kind
 * (title bar with window dots, a screenshot or a glow with the project's initial, one line). Clicking a window opens
 * its project in a `PopupWindow` that grows out of it.
 * The whole window is clickable, but the real control is the <button> in the title (a heading can't sit inside a
 * button): its ::after stretches over the window (z-10: above the picture box, which is positioned and comes later).
 * `glass-lite` (no blur): the windows move every frame.
 * `panels` are rendered on the server (one per card, same order); all stay in the HTML, the popup shows one.
 */
export function ProjectWindows({ cards, panels }: { cards: Card[]; panels: ReactNode[] }) {
  const [tab, setTab] = useState<Kind>("work");
  const [switched, setSwitched] = useState(false); // animate tab changes, but not the first paint
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const windowRefs = useRef<(HTMLElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openedRef = useRef(0); // the window the popup belongs to (written by the click handler only)
  const id = useId();

  // Keep each card's index in the full list: it's the index of its panel and of its window ref
  const shown = cards.map((card, index) => ({ card, index })).filter(({ card }) => card.kind === tab);
  // Desktop shows two rows of four; more scroll inside the grid. The fades (bottom: "more below", top: inside the
  // 1rem padding, so it only touches cards once scrolled) are only added then
  const overflows = shown.length > 8;

  const choose = (kind: Kind) => {
    setTab(kind);
    setSwitched(true);
  };
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = (TABS.findIndex((t) => t.kind === tab) + 1) % TABS.length; // two tabs: either arrow flips
    choose(TABS[next].kind);
    tabRefs.current[next]?.focus();
  };
  const openProject = (i: number) => {
    openedRef.current = i;
    setSelected(i);
    setOpen(true);
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Kind of project"
        onKeyDown={onTabKey}
        className="glass-lite mx-auto mt-4 flex w-fit gap-1 rounded-full p-1"
      >
        {TABS.map((t, ti) => {
          const active = tab === t.kind;
          return (
            <button
              key={t.kind}
              ref={(el) => {
                tabRefs.current[ti] = el;
              }}
              id={`${id}-tab-${t.kind}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${id}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => choose(t.kind)}
              className="relative isolate cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition outline-none hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {/* The highlight slides between the tabs: one element with a shared layoutId, Motion animates the move */}
              {active && (
                <motion.span
                  layoutId={`${id}-pill`}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 -z-10 rounded-full border border-accent/40 bg-accent-soft"
                />
              )}
              {t.label} <span className="font-normal">· {cards.filter((c) => c.kind === t.kind).length}</span>
            </button>
          );
        })}
      </div>

      {/* Keyed by tab: switching swaps the whole grid, which fades and rises in */}
      <motion.ul
        key={tab}
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${tab}`}
        initial={switched ? { opacity: 0, y: 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`grid w-full flex-1 content-center gap-5 py-4 sm:grid-cols-2 lg:-mx-2 lg:min-h-0 lg:w-[calc(100%+1rem)] lg:overflow-y-auto lg:overscroll-contain lg:px-2 lg:[align-content:safe_center] lg:[scrollbar-width:thin] lg:grid-cols-4 lg:gap-6 ${
          overflows ? "lg:pb-12 lg:[mask-image:linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-3rem),transparent)]" : ""
        }`}
      >
        {shown.map(({ card: c, index: i }, pos) => (
          // The bob lives on the <li>, the hover lift on the window inside: both use `transform`, so they need
          // separate elements. A window holds still while you point at it or it has focus.
          <li
            key={c.slug}
            style={{ animationDelay: DELAYS[pos % DELAYS.length] }}
            className={`${FLOATS[pos % FLOATS.length]} hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]`}
          >
            <article
              ref={(el) => {
                windowRefs.current[i] = el;
              }}
              className="glass-lite group relative overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-accent"
            >
              <div className="flex h-10 items-center gap-3 border-b border-foreground/10 px-4">
                <span aria-hidden className="flex shrink-0 gap-1.5">
                  <span className="size-2.5 rounded-full bg-peach" />
                  <span className="size-2.5 rounded-full bg-butter" />
                  <span className="size-2.5 rounded-full bg-sage" />
                </span>
                {/* `truncate` goes on the button: it's an inline-block, so an ellipsis set on the h2 can't reach inside it */}
                <h2 className="min-w-0 text-sm font-semibold">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={() => openProject(i)}
                    className="block max-w-full cursor-pointer truncate outline-none after:absolute after:inset-0 after:z-10"
                  >
                    {c.title}
                  </button>
                </h2>
              </div>
              {/* The same 2:1 frame as the popup, so every screenshot (most are ~2:1) shows whole and at the same scale.
                  Desktop caps the height to the screen so two rows of windows always fit; further rows scroll. */}
              <div className="relative aspect-[2/1] w-full overflow-hidden lg:max-h-[clamp(4rem,calc(50dvh-18.75rem),10rem)]">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 23rem, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-[50%_25%] transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  // No screenshot yet: the Sky Hop bird hopping on the sun / moon glow
                  <div
                    aria-hidden
                    // absolute inset-0, not size-full: the box's height comes from aspect-ratio / max-height, which a
                    // percentage height can't resolve against, so the bird would take its default size and be cut off
                    className="absolute inset-0 grid place-items-center bg-linear-to-br from-glow-1 via-glow-2 to-glow-3"
                  >
                    <span className="motion-safe:animate-hop block h-[55%]">
                      <Bird className="h-full w-auto transition duration-500 group-hover:scale-110" />
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-xs font-semibold tracking-widest uppercase">
                  {c.company ?? "Learning project"}
                </p>
                <p className="mt-1 line-clamp-2 text-sm">{c.summary}</p>
              </div>
            </article>
          </li>
        ))}
      </motion.ul>

      <PopupWindow
        open={open}
        title={cards[selected].title}
        origin={() => windowRefs.current[openedRef.current]}
        onClosed={() => setOpen(false)}
        maxWidth="max-w-3xl"
      >
        {/* Every project's content is here (in the HTML); only the opened one shows */}
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
