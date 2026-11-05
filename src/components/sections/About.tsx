import Image from "next/image";
import { AboutOrbit } from "@/components/sections/AboutOrbit";
import { Companies } from "@/components/sections/Companies";
import { GlassWindow } from "@/components/ui/GlassWindow";
import { Reveal } from "@/components/ui/Reveal";
import { profile } from "@/data/profile";

/**
 * One-screen About page ("orbit of me"): the avatar in front of the sun / moon glow with the stats orbiting it (left),
 * the bio in a glass window (right), and the companies drifting along the bottom.
 */
export function About() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 [@media(min-height:880px)]:py-6">
        {/* Stage: glow, avatar and the orbiting stats. `isolate` keeps their z-index (bubbles behind / in front of the
            avatar) inside this box. The Reveal wraps the whole stage, so it doesn't split the avatar from the bubbles. */}
        <Reveal className="mx-auto w-full max-w-[34rem]">
          <div className="relative isolate mx-auto aspect-square w-[min(100%,calc(100dvh-18.5rem))] min-w-64">
            <div aria-hidden className="absolute inset-[14%] rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-80 blur-3xl" />
            <Image
              src={profile.illustration}
              alt={profile.name}
              fill
              sizes="(min-width: 1024px) 34rem, 80vw"
              className="pointer-events-none z-10 object-contain object-bottom"
            />
            <AboutOrbit stats={profile.stats} />
          </div>
        </Reveal>

        {/* Bio. The glass window itself doesn't fade in (a fading ancestor switches its blur off); its text does. */}
        <GlassWindow title="About me" heading="h1" orbitDuration={20}>
          {/* Text size follows the screen height too: the larger size only where there's room.
              Desktop: the page stays one screen, so when the text is taller than the space, this box scrolls on its
              own (focusable, so keyboard users can scroll it too: Safari doesn't make scroll boxes focusable). The bottom 3rem
              fades out as a "there's more" cue; the extra bottom padding lets the last line clear the fade at the end. */}
          <div
            tabIndex={0}
            role="region"
            aria-label="About me text"
            className="space-y-3 p-5 text-base leading-relaxed outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent sm:p-6 lg:max-h-[calc(100dvh-19.5rem)] lg:overflow-y-auto lg:overscroll-contain lg:pb-12 lg:[scrollbar-width:thin] lg:[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)] [@media(min-height:880px)]:space-y-4 [@media(min-height:880px)]:p-8 [@media(min-height:880px)]:text-lg"
          >
            {profile.about.map((p, i) => (
              <Reveal key={i} delay={0.1 + i * 0.1}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </GlassWindow>
      </div>

      <Companies />
    </section>
  );
}
