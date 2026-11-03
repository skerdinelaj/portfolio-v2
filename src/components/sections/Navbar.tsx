"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { sitePages } from "@/data/pages";
import { profile } from "@/data/profile";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Slide away while scrolling down, come back on any scroll up; always shown near the top
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 80) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  const linkClass = (href: string) =>
    pathname === href ? "text-accent font-medium" : "text-muted transition hover:text-foreground";

  return (
    <motion.header
      animate={{ y: hidden && !open ? "-100%" : 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      // Keyboard users tabbing into the nav must be able to see it
      onFocusCapture={() => setHidden(false)}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur"
    >
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          {profile.name}
        </Link>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center gap-6 text-sm md:flex">
            {sitePages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} aria-current={pathname === p.href ? "page" : undefined} className={linkClass(p.href)}>
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="md:ml-4">
            <ThemeToggle />
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <FiX className="size-5" /> : <FiMenu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-border px-4 py-3 md:hidden">
          {sitePages.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                aria-current={pathname === p.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`block py-2 ${linkClass(p.href)}`}
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.header>
  );
}
