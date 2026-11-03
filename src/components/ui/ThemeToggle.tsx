"use client";

import { FiMoon, FiSun } from "react-icons/fi";

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  // Both icons are rendered and CSS shows the right one, so server and client HTML match.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="grid size-9 place-items-center rounded-full border border-border text-foreground transition hover:border-accent hover:text-accent"
    >
      <FiMoon className="size-4 dark:hidden" />
      <FiSun className="hidden size-4 dark:block" />
    </button>
  );
}
