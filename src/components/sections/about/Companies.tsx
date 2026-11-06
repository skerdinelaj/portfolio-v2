import Image from "next/image";
import { experience } from "@/data/experience";

/**
 * The companies I've worked with, as a belt of glass pills drifting sideways in an endless loop (see `.marquee-track`
 * in globals.css; it keeps moving on hover and stands still with reduced motion).
 * Each company gets an equal slot, so a wide screen shows exactly the 5 companies across (fewer on smaller screens).
 * The track holds the list twice = 10 slots, each 10% of the track; the track is (10 ÷ visible slots) × the belt's
 * width. No gaps between slots, so half the track is exactly one copy of the list and the loop never jumps.
 * `glass-lite` (no blur): the track moves every frame.
 */
export function Companies() {
  // Twice, so the second copy slides in as the first slides out
  const items = [...experience, ...experience];

  return (
    <section aria-label="Companies I've worked with" className="flex items-center gap-4 py-4 sm:gap-6 sm:py-5">
      <p className="hidden shrink-0 pl-6 text-xs font-semibold tracking-widest uppercase sm:block">Worked with</p>
      <div className="relative min-w-0 flex-1 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {/* Visible slots: 2 on phones, 3 from md, 4 from lg, 5 from xl */}
        <ul className="marquee-track flex w-[500%] md:w-[333.3333%] lg:w-[250%] xl:w-[200%]">
          {items.map((job, i) => (
            <li key={i} aria-hidden={i >= experience.length} className="flex w-[10%] shrink-0 justify-center px-2">
              <span className="glass-lite flex h-11 max-w-full items-center gap-2 rounded-full px-4 sm:px-5">
                {job.logo && <Image src={job.logo} alt="" width={80} height={24} className="h-5 w-auto" />}
                <span className="truncate text-sm font-semibold whitespace-nowrap sm:text-base">{job.company}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
