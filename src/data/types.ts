import type { IconType } from "react-icons";

export type Job = {
  company: string;
  companyNote?: string;
  role: string;
  start: string;
  end: string;
  /** Path under /public, e.g. "/logos/oracle.svg". Falls back to the company name. */
  logo?: string;
  url?: string;
  highlights: { title: string; text: string; tech?: string[] }[];
};

export type Tech = { name: string; icon: IconType; level: "Experienced" | "Intermediate" };

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
