import Link from "next/link";
import { OrbitNav } from "@/components/sections/OrbitNav";
import { PhotoReveal } from "@/components/ui/PhotoReveal";
import { Reveal } from "@/components/ui/Reveal";
import { RoleCycler } from "@/components/ui/RoleCycler";
import { sitePages } from "@/data/pages";
import { profile } from "@/data/profile";
import type { SitePage } from "@/data/types";

function PageLink({ page, index }: { page: SitePage; index: number }) {
  return (
    <Link
      href={page.href}
      className="group flex w-full flex-col rounded-2xl border border-border bg-surface p-4 transition hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span className="text-sm font-bold text-foreground">{String(index + 1).padStart(2, "0")}</span>
      <span className="mt-1 text-xs text-foreground">{page.teaser}</span>
      <span className="mt-1 text-xl font-medium tracking-tight transition">{page.label}</span>
    </Link>
  );
}

export function HomeHub() {
  return (
    // The site header (h-14, root layout) sits above; on desktop the hub fills exactly the rest of the screen
    <div className="flex flex-1 flex-col overflow-x-clip lg:h-[calc(100dvh-3.5rem)] lg:flex-none lg:overflow-hidden">
      <main className="relative flex-1">
        {/* Centre: photo standing on the bottom edge, title and name across it.
            `isolate` makes this box its own stacking context, so the orbit ring's back cards (negative z-index)
            slide behind the photo but stay above this box's background. */}
        <div className="relative isolate h-[min(78svh,640px)] overflow-hidden bg-background lg:absolute lg:inset-0 lg:h-auto">
          <Reveal className="pointer-events-none absolute bottom-0 left-1/2 aspect-[1242/1253] h-[92%] -translate-x-1/2">
            <div className="absolute inset-x-[10%] top-[12%] bottom-[30%] rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-80 blur-3xl" aria-hidden />
            <PhotoReveal photo={profile.photo} illustration={profile.illustration} alt={profile.name} sizes="(min-width: 1024px) 90vh, 600px" />
          </Reveal>

          <div className="pointer-events-none absolute inset-x-0 top-[48%] flex flex-col items-center px-2 text-center">
            <p className="rounded-sm bg-surface/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] shadow-sm ring-1 ring-border sm:text-sm">
              <RoleCycler roles={profile.roles} />
            </p>
            {/* Theme text colour with a page-coloured outline (`text-outline`, globals.css): readable over any image */}
            <h1 className="text-outline mt-3 text-[clamp(3rem,10vw,10rem)] leading-[0.9] font-semibold tracking-tight whitespace-nowrap text-foreground">
              {profile.name}
            </h1>
          </div>

          {/* Pages, desktop: a ring orbiting the photo, turned by scrolling */}
          <OrbitNav pages={sitePages.map(({ href, label, teaser }) => ({ href, label, teaser }))} />
        </div>

        {/* Pages, phones and tablets: a card grid under the photo */}
        <nav aria-label="Pages" className="grid grid-cols-2 gap-3 px-4 py-8 sm:px-6 lg:hidden">
          {sitePages.map((page, i) => (
            <Reveal key={page.href} x={i % 2 ? 24 : -24} delay={0.15 + i * 0.06} className="flex">
              <PageLink page={page} index={i} />
            </Reveal>
          ))}
        </nav>
      </main>
    </div>
  );
}
