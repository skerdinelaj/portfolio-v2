# portfolio-v2

Personal portfolio of Skerdi Nelaj, built with Next.js (App Router), TypeScript, Tailwind CSS and Motion.

## Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

## Editing content

All content lives in `src/data/`; components only render it.

| File | What it holds |
|---|---|
| `profile.ts` | Name, roles, tagline, about text, stats, links |
| `experience.ts` | Companies and jobs (also feeds the logo strip) |
| `tech.ts` | Tech stack grouped by category |
| `projects.ts` | Featured work projects and side projects |
| `testimonials.ts` | Colleague reviews and reference letters |

Static files go in `public/`: `logos/`, `projects/`, `reviewers/`, `letters/`.
