import type { IconType } from "react-icons";

export type Job = {
  company: string;
  companyNote?: string;
  /** Shorter name for tight spots (the Experience star labels on small screens). Falls back to `company`. */
  short?: string;
  role: string;
  start: string;
  end: string;
  /** Path under /public, e.g. "/logos/oracle.svg". Falls back to the company name. */
  logo?: string;
  url?: string;
  /** The story of this job, as paragraphs: the company, my journey there, my role (top of the job popup). */
  summary?: string[];
  /** The projects I worked on: what each one is and what I did on it. No tech names (the user's choice). */
  highlights: { title: string; text: string }[];
};

export type Tech = {
  name: string;
  icon: IconType;
  level: "Experienced" | "Intermediate";
  /** Brand colour for the logo. Leave out for black logos so they follow the text colour in both themes. */
  color?: string;
};

export type TechGroup = { category: string; items: Tech[] };

export type Project = {
  slug: string;
  title: string;
  company?: string;
  summary: string;
  tech: string[];
  image?: string;
  github?: string;
  live?: string;
  /** "work": built at a company (shows the company); "learning": my own learning projects. The Projects page tabs. */
  kind: "work" | "learning";
};

/** A colleague's review. With no `quote` yet it shows as "review on its way": never write one for them. */
export type Testimonial = {
  name: string;
  /** Companies we worked at together, as named in experience.ts */
  companies: string[];
  /** Their own words, added only once they've sent them */
  quote?: string;
  role?: string;
  photo?: string;
  linkedin?: string;
};

/** One titled part of a letter (the opening part has no heading). */
export type LetterSection = { heading?: string; paragraphs: string[] };

/** A signed reference letter, quoted in full on /reviews (contact details, addresses and signatures left out). */
export type ReferenceLetter = {
  slug: string;
  author: string;
  role: string;
  company: string;
  /** What the author's relationship to me was, one line */
  relation: string;
  /** As written on the letter, e.g. "30.09.2026" */
  date: string;
  /** The line shown on the card */
  excerpt: string;
  body: LetterSection[];
  /** Path under /public, e.g. "/letters/oracle-reference.pdf" (only a copy with private details removed) */
  pdf?: string;
};

/** A top-level page, shown as a card on the home page and as a Navbar link. */
export type SitePage = {
  href: string;
  label: string;
  teaser: string;
  icon: IconType;
};
