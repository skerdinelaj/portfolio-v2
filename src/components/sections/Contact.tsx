import { ContactForm } from "@/components/sections/ContactForm";
import { ContactLinks } from "@/components/sections/ContactLinks";
import { GlassWindow } from "@/components/ui/GlassWindow";
import { profile } from "@/data/profile";

// Same as the popup: a window pauses its float while hovered or focused
const floating = "hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]";

/**
 * The /contact page for direct visits (a shared link or a refresh). Client-side links to /contact open the
 * floating popup instead (see app/@modal/(.)contact). Same two windows, floating in the middle, without close buttons.
 * The windows aren't wrapped in <Reveal>: fading an ancestor would switch their glass blur off (see GlassWindow).
 */
export function Contact() {
  return (
    <section className="relative isolate flex flex-1 items-center justify-center px-3 py-2 sm:px-6 sm:py-6">
      <div aria-hidden className="absolute top-1/2 left-1/2 -z-10 size-[min(40rem,90vw)] -translate-1/2 rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-70 blur-3xl" />
      <div className="flex w-full max-w-[26rem] flex-col gap-5 sm:max-w-[50rem] sm:flex-row sm:items-start sm:justify-center sm:gap-5">
        <div className="w-full sm:max-w-[30rem]">
          <div className={`motion-safe:animate-float ${floating}`}>
            <GlassWindow title="Let's talk." heading="h1" orbitDuration={18}>
              <ContactForm to={profile.email} />
            </GlassWindow>
          </div>
        </div>
        <div className="w-full shrink-0 sm:w-72">
          <aside aria-label="Other ways to reach me" className={`motion-safe:animate-float-slow ${floating}`}>
            <GlassWindow title="Find me on" orbitDuration={11}>
              <ContactLinks />
            </GlassWindow>
          </aside>
        </div>
      </div>
    </section>
  );
}
