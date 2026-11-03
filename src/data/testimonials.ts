import type { ReferenceLetter, Testimonial } from "./types";

// PLACEHOLDERS: replace with real reviews (with your colleagues' permission),
// then remove `placeholder: true`. Reviewer photos go in /public/reviewers.
export const testimonials: Testimonial[] = [
  {
    quote: "Colleague review goes here: 2–3 sentences about something specific you did.",
    name: "Colleague Name",
    role: "Role",
    company: "Company",
    placeholder: true,
  },
  {
    quote: "Colleague review goes here: 2–3 sentences about something specific you did.",
    name: "Colleague Name",
    role: "Role",
    company: "Company",
    placeholder: true,
  },
  {
    quote: "Colleague review goes here: 2–3 sentences about something specific you did.",
    name: "Colleague Name",
    role: "Role",
    company: "Company",
    placeholder: true,
  },
];

// PLACEHOLDERS: put the PDFs in /public/letters (remove phone numbers, private emails and signatures first).
export const referenceLetters: ReferenceLetter[] = [
  {
    author: "Author Name",
    role: "Role",
    company: "Company",
    excerpt: "Highlighted excerpt from the first reference letter.",
    placeholder: true,
  },
  {
    author: "Author Name",
    role: "Role",
    company: "Company",
    excerpt: "Highlighted excerpt from the second reference letter.",
    placeholder: true,
  },
];
