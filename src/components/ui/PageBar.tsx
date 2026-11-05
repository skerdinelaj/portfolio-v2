"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useEffect } from "react";

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * The line under the site header on every page except home: the page's name on the left, "Esc · Home" on the right.
 * Pressing Esc anywhere on the page also goes home.
 *
 * Rendered by the route-group layouts, and the page is found with `useSelectedLayoutSegment()` (the segment below the
 * layout), not the URL: when the contact popup opens over /about the URL becomes /contact, but this layout still
 * shows /about, so its segment is still "about".
 */
export function PageBar({ pages }: { pages: { href: string; label: string }[] }) {
  const segment = useSelectedLayoutSegment();
  const router = useRouter();
  const label = pages.find((p) => p.href === `/${segment}`)?.label;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      // Esc already used by something else: the header menu or contact popup (they call preventDefault), a native
      // <dialog> popup (its `cancel` comes after this keydown, so look for it), or a field you're typing in
      if (e.defaultPrevented || isTyping(e.target) || document.querySelector("dialog[open]")) return;
      router.push("/");
    };
    // On window, so it runs after the document listeners of the menu and the contact popup
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-4 border-b border-border px-4 text-sm sm:px-6">
      {/* The page's one <h1>: pages don't show a big title of their own */}
      <h1 className="truncate font-medium">{label}</h1>
      <Link
        href="/"
        aria-label="Back to home (Esc)"
        className="group flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {/* <kbd> gets a monospace font and no font axes by default (browser + Tailwind preflight): back to Fraunces, SOFT */}
        <kbd className="rounded-md border border-b-2 border-border bg-surface px-1.5 py-0.5 font-sans text-xs font-medium transition-[border-color] [font-variation-settings:inherit] group-hover:border-accent">
          Esc
        </kbd>
        <span className="underline-offset-4 group-hover:underline">Home</span>
      </Link>
    </div>
  );
}
