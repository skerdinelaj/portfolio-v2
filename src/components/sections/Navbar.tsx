"use client";

import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { profile } from "@/data/profile";

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#tech", label: "Tech" },
  { href: "#projects", label: "Projects" },
  { href: "#testimonials", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="font-semibold tracking-tight">
          {profile.name}
        </a>

        <div className="flex items-center gap-2">
          <ul className="hidden items-center gap-6 text-sm text-muted md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-foreground">
                  {l.label}
                </a>
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
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-muted hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
