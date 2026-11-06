/**
 * The Sky Hop bird, side view (flying, wing flapping), drawn in the theme's pastel tokens.
 * `BirdShapes` is the bare <g> so SkyHop can swap it with its front view inside one <svg>;
 * `Bird` is the ready-to-place picture. No hooks, so server components can use it too.
 */
export function BirdShapes() {
  return (
    <>
      <g className="stroke-foreground" strokeWidth="1.6" strokeLinejoin="round">
        <ellipse cx="17" cy="5.5" rx="2" ry="3.5" transform="rotate(-25 17 5.5)" className="fill-rose" />
        <circle cx="18" cy="19" r="11" className="fill-butter" />
        <ellipse cx="20" cy="23.5" rx="6" ry="4" className="fill-peach" strokeWidth="0" />
        <g className="motion-safe:animate-wing origin-[14px_19px]">
          <ellipse cx="14" cy="19.5" rx="5.5" ry="3.2" className="fill-rose" />
        </g>
        <path d="M28 16.5 L35 19 L28 21.5 Z" className="fill-peach" />
        <circle cx="23" cy="15.5" r="2.8" className="fill-surface" />
      </g>
      <circle cx="23.8" cy="15.5" r="1.2" className="fill-foreground" />
    </>
  );
}

export function Bird({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" aria-hidden className={className}>
      <BirdShapes />
    </svg>
  );
}
