import { FiBriefcase, FiCpu, FiFolder, FiMail, FiMessageSquare, FiUser } from "react-icons/fi";
import type { SitePage } from "./types";

/** Order matters: on the home page they fill a 2-column grid row by row (01 left, 02 right, 03 left...). */
export const sitePages: SitePage[] = [
  { href: "/projects", label: "Projects", teaser: "Things I've built", icon: FiFolder },
  { href: "/experience", label: "Experience", teaser: "Roles and what I shipped", icon: FiBriefcase },
  { href: "/about", label: "About", teaser: "Who I am and how I work", icon: FiUser },
  { href: "/tech", label: "Tech Stack", teaser: "The tools I work with", icon: FiCpu },
  { href: "/reviews", label: "Reviews", teaser: "What colleagues say", icon: FiMessageSquare },
  { href: "/contact", label: "Contact", teaser: "Let's work together", icon: FiMail },
];

/** Just the href and label: plain data that can be passed to Client Components (the icons are functions, which can't). */
export const pageLinks = sitePages.map(({ href, label }) => ({ href, label }));
