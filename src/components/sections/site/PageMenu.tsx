"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { usePinHeader } from "@/components/ui/AutoHideHeader";
import type { SitePage } from "@/data/types";

type MenuPage = Omit<SitePage, "icon">;

const MAX_SIZE = 384; // panel width/height in px
const RADIUS = 0.34; // orbit radius as a fraction of the panel size
const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

// Six dots around "SN", one per page: a preview of the orbit the menu opens into.
// Rounded to 2 decimals: Math.sin/cos can differ in the last digits between Node (server render) and the browser,
// and the style strings must match exactly or hydration fails (e.g. "75%" on the server vs "75.00000000000003%").
const pct = (n: number) => `${Math.round(n * 100) / 100}%`;
const DOTS = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2;
  return { left: pct(50 + Math.sin(a) * 50), top: pct(50 - Math.cos(a) * 50), big: i % 2 === 0 };
});

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * Header menu: a small version of the home ring. The pages sit around the avatar like a clock dial
 * (first page at the top, then clockwise) and spring out from the centre when it opens.
 * The trigger is the initials inside a tiny orbit of six dots. Shortcuts while open: 1–6 jump to the pages in that
 * clockwise order, Esc closes.
 * It's a disclosure (a button with aria-expanded showing a <nav> of links), not an ARIA `role="menu"`.
 */
export function PageMenu({ pages, avatar, initials }: { pages: MenuPage[]; avatar: string; initials: string }) {
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState({ size: MAX_SIZE, left: 8 });
  const pathname = usePathname();
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  usePinHeader(open); // keep the header on screen while the menu is open

  // Size and position are fixed at the moment it opens, so the pills have pixel targets to spring to.
  // It sits under the button, pulled left if needed so it never runs off the screen (phones).
  const toggle = () => {
    const size = Math.min(MAX_SIZE, window.innerWidth - 16);
    const left = Math.max(8, Math.min((buttonRef.current?.offsetLeft ?? 0) + 8, window.innerWidth - size - 8));
    setBox({ size, left });
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (e.target instanceof Node && !rootRef.current?.contains(e.target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault(); // handled: PageBar's "Esc goes home" leaves it alone
        close();
        buttonRef.current?.focus();
        return;
      }
      const page = pages[Number(e.key) - 1];
      if (page && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        close();
        router.push(page.href);
      }
    };
    // The home page never scrolls on desktop (the wheel turns the ring), so listen for wheel as well as scroll
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("wheel", close, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close);
      window.removeEventListener("wheel", close);
    };
  }, [open, pages, router]);

  const { size, left } = box;
  const radius = size * RADIUS;

  return (
    // Not `relative`: the backdrop and panel are positioned against the sticky header, so the backdrop spans its full width
    <div
      ref={rootRef}
      className="flex items-stretch"
      onBlur={(e) => {
        // Tabbed out of the menu. (relatedTarget is null for clicks on non-focusable spots: the pointer handler covers those.)
        if (e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        // The visible text "SN" stays at the start of the name, so voice control ("click SN") still works
        aria-label={`${initials}, menu`}
        onClick={toggle}
        className="group flex items-center border-r border-border px-3 transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:px-5"
      >
        <span className="relative grid size-11 place-items-center">
          <span className="text-base font-semibold tracking-tight">{initials}</span>
          {/* The orbit: spreads out on hover; when the menu opens the dots fly outward and fade, as if they became the pills.
              Two layers because both use `transform`: the outer one scales, the inner one spins. */}
          <span
            aria-hidden
            className="absolute inset-0 transition duration-500 ease-out group-hover:scale-115 group-aria-expanded:scale-[1.9] group-aria-expanded:opacity-0"
          >
            <span className="absolute inset-0 rounded-full border border-dashed border-border motion-safe:animate-[spin_14s_linear_infinite]">
              {DOTS.map((d, i) => (
                <span
                  key={i}
                  style={{ left: d.left, top: d.top }}
                  className={`absolute -translate-1/2 rounded-full bg-accent ${d.big ? "size-[5px]" : "size-1 opacity-60"}`}
                />
              ))}
            </span>
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dims the page under the panel; a press here closes the menu */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onPointerDown={() => setOpen(false)}
              className="absolute inset-x-0 top-full h-dvh bg-background/50"
            />
            <motion.nav
              id={panelId}
              aria-label="Site menu"
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6, transition: { duration: 0.15 } }}
              transition={SPRING}
              style={{ width: size, height: size, left }}
              className="absolute top-full mt-2 origin-top-left overflow-hidden rounded-[2rem] border border-border bg-surface shadow-xl"
            >
              {/* Same pastel glow as behind the hero photo */}
              <div aria-hidden className="absolute inset-[18%] rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-80 blur-2xl" />
              {/* The orbit path, turning slowly */}
              <div
                aria-hidden
                style={{ width: radius * 2, height: radius * 2 }}
                className="absolute top-1/2 left-1/2 -translate-1/2 rounded-full border border-dashed border-accent/40 motion-safe:animate-[spin_60s_linear_infinite]"
              />

              {/* Centre: the illustrated face, a link home. Zoomed in on the head of the full-body image,
                  with the head placed low in the circle so the hair isn't cut off. */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING}
                className="absolute top-1/2 left-1/2 -mt-12 -ml-12 size-24"
              >
                {/* draggable={false} on both: a native drag would show a "ghost" of the whole full-body image file
                    (the browser ignores the CSS crop and zoom), so dragging the avatar is turned off */}
                <Link
                  href="/"
                  aria-label="Home"
                  aria-current={pathname === "/" ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  draggable={false}
                  className="relative block size-full overflow-hidden rounded-full border-4 border-surface bg-accent-soft shadow-md transition select-none hover:scale-105 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Image
                    src={avatar}
                    alt=""
                    fill
                    sizes="300px"
                    draggable={false}
                    className="origin-[50%_-12%] scale-[2.5] object-cover"
                  />
                </Link>
              </motion.div>

              <ul>
                {pages.map((page, i) => {
                  const angle = (i / pages.length) * Math.PI * 2; // 0 = top, clockwise
                  const here = pathname === page.href;
                  return (
                    <motion.li
                      key={page.href}
                      initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
                      animate={{ x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius, scale: 1, opacity: 1 }}
                      transition={{ ...SPRING, delay: 0.04 + i * 0.04 }}
                      className="absolute top-1/2 left-1/2"
                    >
                      <Link
                        href={page.href}
                        aria-current={here ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className="flex -translate-1/2 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-sm transition hover:-translate-y-[calc(50%+3px)] hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[current=page]:border-accent aria-[current=page]:bg-accent-soft"
                      >
                        {page.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
