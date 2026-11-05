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
  featured: boolean;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  photo?: string;
  linkedin?: string;
  /** true until you replace it with a real review */
  placeholder?: boolean;
};

export type ReferenceLetter = {
  author: string;
  role: string;
  company: string;
  excerpt: string;
  /** Path under /public, e.g. "/letters/oracle-reference.pdf" */
  pdf?: string;
  placeholder?: boolean;
};

/** A top-level page, shown as a card on the home page and as a Navbar link. */
export type SitePage = {
  href: string;
  label: string;
  teaser: string;
  icon: IconType;
};
