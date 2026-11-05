import { PageMenu } from "@/components/sections/PageMenu";
import { AutoHideHeader } from "@/components/ui/AutoHideHeader";
import { LiveClock } from "@/components/ui/LiveClock";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { sitePages } from "@/data/pages";
import { profile } from "@/data/profile";

const initials = profile.name
  .split(" ")
  .map((w) => w[0])
  .join("");

/** The one header for every route, rendered by the root layout. Server Component; the menu, clock and toggle are client leaves. */
export function SiteHeader() {
  return (
    <AutoHideHeader className="sticky top-0 z-50 flex h-14 shrink-0 items-stretch border-b border-border bg-background/85 text-sm backdrop-blur">
      {/* The initials open the menu; home is the avatar in its centre. Icons are functions, which can't cross into a Client Component, so only the plain fields are passed */}
      <PageMenu pages={sitePages.map(({ href, label, teaser }) => ({ href, label, teaser }))} avatar={profile.illustration} initials={initials} />

      <div className="ml-auto flex items-stretch">
        {profile.status && (
          <p className="hidden items-center gap-2 border-l border-border px-4 text-foreground sm:flex sm:px-6">
            <span className="size-2 rounded-full bg-positive" aria-hidden />
            {profile.status}
          </p>
        )}
        <p className="hidden items-center border-l border-border px-4 text-foreground md:flex md:px-6">
          <LiveClock />
        </p>
        <div className="flex items-center border-l border-border px-3 sm:px-4">
          <ThemeToggle />
        </div>
      </div>
    </AutoHideHeader>
  );
}
