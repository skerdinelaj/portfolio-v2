import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { OrbitNav } from "@/components/sections/OrbitNav";
import { LiveClock } from "@/components/ui/LiveClock";
import { PhotoReveal } from "@/components/ui/PhotoReveal";
import { Reveal } from "@/components/ui/Reveal";
import { RoleCycler } from "@/components/ui/RoleCycler";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { sitePages } from "@/data/pages";
import { profile } from "@/data/profile";
import type { SitePage } from "@/data/types";

const initials = profile.name
  .split(" ")
  .map((w) => w[0])
  .join("");

function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-stretch border-b border-border text-sm">
      <Link href="/" className="flex items-center border-r border-border px-4 font-bold tracking-tight sm:px-6" aria-label={`${profile.name}, home`}>
        {initials}
      </Link>
      <div className="flex items-center gap-1 px-2 sm:px-4">
        <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 text-muted transition hover:text-foreground">
          <FaGithub className="size-4" />
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 text-muted transition hover:text-foreground">
          <FaLinkedin className="size-4" />
        </a>
      </div>

      <div className="ml-auto flex items-stretch">
        {profile.status && (
          <p className="hidden items-center gap-2 border-l border-border px-4 text-muted sm:flex sm:px-6">
            <span className="size-2 rounded-full bg-positive" aria-hidden />
            {profile.status}
          </p>
        )}
        <p className="hidden items-center border-l border-border px-4 text-muted md:flex md:px-6">
          <LiveClock />
        </p>
        <div className="flex items-center border-l border-border px-3 sm:px-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function PageLink({ page, index }: { page: SitePage; index: number }) {
  return (
    <Link
      href={page.href}
      className="group flex w-full flex-col rounded-2xl border border-border bg-surface p-4 transition hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <span className="font-mono text-sm font-bold text-accent">{String(index + 1).padStart(2, "0")}</span>
      <span className="mt-1 font-mono text-xs text-muted">{page.teaser}</span>
      <span className="mt-1 text-xl font-medium tracking-tight transition group-hover:text-accent">{page.label}</span>
    </Link>
  );
}

export function HomeHub() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip lg:h-dvh lg:overflow-hidden">
      <TopBar />

      <main className="relative flex-1">
        {/* Centre: photo standing on the bottom edge, title and name across it.
            `isolate` makes this box its own stacking context, so the orbit ring's back cards (negative z-index)
            slide behind the photo but stay above this box's background. */}
        <div className="relative isolate h-[min(78svh,640px)] overflow-hidden bg-background lg:absolute lg:inset-0 lg:h-auto">
          <Reveal className="pointer-events-none absolute bottom-0 left-1/2 aspect-[1242/1253] h-[92%] -translate-x-1/2">
            <div className="absolute inset-x-[10%] top-[12%] bottom-[30%] rounded-full bg-linear-to-br from-peach via-butter to-rose opacity-80 blur-3xl" aria-hidden />
            <PhotoReveal photo={profile.photo} illustration={profile.illustration} alt={profile.name} sizes="(min-width: 1024px) 90vh, 600px" />
          </Reveal>

          <div className="pointer-events-none absolute inset-x-0 top-[48%] flex flex-col items-center px-2 text-center">
            <p className="rounded-sm bg-surface/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] shadow-sm ring-1 ring-border sm:text-sm">
              <RoleCycler roles={profile.roles} />
            </p>
            {/* Theme text colour with a page-coloured outline (`text-outline`, globals.css): readable over any image */}
            <h1 className="text-outline mt-3 text-[clamp(3rem,10vw,10rem)] leading-[0.9] font-bold tracking-tighter whitespace-nowrap text-foreground">
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
