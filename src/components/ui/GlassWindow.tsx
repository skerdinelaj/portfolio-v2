import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { OrbitEdge } from "@/components/ui/OrbitEdge";

/**
 * A "celestial glass" window (contact popup and page, About): a frosted card (the sun / moon glow shines through),
 * a dashed orbit around its edge with a travelling dot, a quiet header (title + optional ✕) above a hairline. Without a
 * title or ✕ (About) there's no header at all.
 * No hooks of its own, so it renders on the server and inside client components alike; `onClose` is only passed
 * from the contact popup.
 * Don't put it inside anything whose opacity animates (e.g. <Reveal>): the blur switches off under an ancestor with
 * opacity < 1 and pops back at the end. To fade the window, set the CSS variable `--window-opacity` on an ancestor
 * (the contact popup animates it): it's applied to the glass card and the orbit line *themselves*, and an element's
 * own opacity doesn't switch off its blur.
 */
export function GlassWindow({
  title,
  titleId,
  heading: Heading = "h2",
  onClose,
  closeLabel = "Close",
  orbitDuration,
  children,
}: {
  title?: string;
  titleId?: string;
  heading?: "h1" | "h2";
  onClose?: () => void;
  closeLabel?: string;
  /** Seconds per lap of the orbit dot; give neighbouring windows different speeds */
  orbitDuration?: number;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {/* opacity-(--window-opacity): when the variable isn't set, the declaration is invalid and opacity stays 1 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-(--window-opacity)">
        <OrbitEdge radius={32} duration={orbitDuration} />
      </div>
      <div className="glass overflow-hidden rounded-3xl opacity-(--window-opacity)">
        {(title || onClose) && (
          <div className="flex h-12 items-center justify-between gap-3 border-b border-foreground/10 pr-3 pl-6 sm:h-14">
            {title && (
              <Heading id={titleId} className="truncate text-xl font-semibold tracking-tight">
                {title}
              </Heading>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="grid size-8 shrink-0 place-items-center rounded-full border border-foreground/15 transition hover:rotate-90 hover:border-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <FiX className="size-4" aria-hidden />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
