import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { OrbitEdge } from "@/components/ui/OrbitEdge";

/**
 * A "celestial glass" window for the contact popup and page: a frosted card (the sun / moon glow shines through),
 * a dashed orbit around its edge with a travelling dot, a quiet header (title + optional ✕) above a hairline.
 * No hooks of its own, so it renders on the server (the /contact page) and inside the client popup alike;
 * `onClose` is only passed from the popup.
 */
export function ContactWindow({
  title,
  titleId,
  heading: Heading = "h2",
  onClose,
  closeLabel = "Close",
  orbitDuration,
  children,
}: {
  title: string;
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
      <OrbitEdge radius={32} duration={orbitDuration} />
      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex h-12 items-center justify-between gap-3 border-b border-foreground/10 pr-3 pl-6 sm:h-14">
          <Heading id={titleId} className="truncate text-xl font-semibold tracking-tight">
            {title}
          </Heading>
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
        {children}
      </div>
    </div>
  );
}
