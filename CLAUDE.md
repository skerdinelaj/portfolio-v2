@AGENTS.md

# Portfolio v2: project rules

Personal portfolio: a one-screen home hub plus six content pages. Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript (strict), Tailwind CSS v4, Motion, react-icons. No backend, database, or CMS: all content is static TypeScript in `src/data/`.

## Teaching mode (always on)

This project is also a course: the owner is an experienced React developer learning Next.js by building it. Every change is explained, not just made.

- **Before changing code**, explain briefly:
  1. what we'll do and how (files, approach);
  2. the realistic alternatives (2–3) and their trade-offs;
  3. why the chosen option is best here;
  4. the plain-React vs Next.js difference whenever the change touches a Next feature (routing, layouts, Server/Client Components, caching, `next/image`, `next/font`, metadata, Server Actions, prefetching).
- **After the change**, explain what each touched file now does and any new concept, in plain words. Link the relevant guide in `node_modules/next/dist/docs/` when one applies.
- **Append an entry to `LEARNING.md`** for every meaningful change, using the template at the bottom of that file. Trivial edits (typos, copy) don't need one.
- Skip React basics (hooks, state, props). Spend the words on Next.js specifics, browser/CSS mechanics, performance and accessibility reasons.
- When unsure which option to take, give a recommendation and say why, don't just list options.
- If the user asks "why" about something already built, answer from `LEARNING.md` first and extend the entry if the answer adds something.

## Before writing code

- This Next.js version differs from your training data. Read the matching guide in `node_modules/next/dist/docs/` before using any Next.js API, file convention, or config option. Trust those docs over memory, and heed deprecation notices.
- `cacheComponents` and `partialPrefetching` are both enabled in `next.config.ts`. Caching, prerendering, and `<Link>` prefetching follow the Cache Components model (`01-app/01-getting-started/08-caching.md`), not the old `revalidate` / `dynamic` segment config model.
- Don't add a dependency when the platform or an existing one already covers it. Ask before adding any new package.

## Commands

- `npm run dev`: dev server (Turbopack)
- `npm run build`: production build. Run it after non-trivial changes; it is the type check and prerender check.
- `npm run lint`: ESLint (flat config, `next/core-web-vitals` + `next/typescript`). Must pass with no errors.

## Directory layout

```
src/
  app/
    layout.tsx         Root: <html>, fonts, theme script, MotionProvider, SiteHeader (one header for every route)
    page.tsx           Home hub (renders HomeHub). One screen below the header, no Footer
    (pages)/           Route group for /about /experience /tech /projects /reviews /contact
      layout.tsx       ScrollProgress + <main> + Footer for every inner page
    globals.css        Tokens, dark mode, PhotoReveal + theme-switch + overscroll rules
  components/
    sections/          One component per page / big block (SiteHeader, PageMenu, HomeHub, OrbitNav, About, Projects, ...)
    ui/                Reusable building blocks (Section, Reveal, PhotoReveal, Timeline, ScrollProgress, ...)
  data/                Static content + types.ts (the content model). pages.ts lists the six pages
LEARNING.md            Learning journal: one entry per meaningful change (see Teaching mode)
public/                avatar.webp (cut-out photo), avatar-illustration.webp (aligned illustration), projects/, logos/, ...
```

- `src/app/` holds routing files only. Put components in `src/components/` and content in `src/data/`, not next to routes.
- A new page: add `src/app/(pages)/<slug>/page.tsx` (export `metadata` with a `title`), put its content in `components/sections/<Name>.tsx` wrapped in `<Section eyebrow title>` (renders the page's single `<h1>`), and add it to `src/data/pages.ts`. That one list feeds the home ring, the mobile card grid and the header Menu.
- Home page order and ring position come from the order in `pages.ts`.
- A component goes in `ui/` only when two or more sections use it, or it is a generic primitive. Otherwise keep it inside its section file.
- Deeper routes (e.g. `/projects/[slug]`) go inside `(pages)/` so they get the shared layout; keep `data/` as the source of truth.

## Server vs. Client Components

- Everything is a Server Component by default. Keep it that way.
- Add `"use client"` only to the smallest leaf that needs state, effects, event handlers, browser APIs, or Motion. Existing client leaves: `Reveal`, `MotionProvider`, `RoleCycler`, `CountUp`, `ThemeToggle`, `LiveClock`, `PhotoReveal`, `Timeline`, `ScrollProgress`, `AutoHideHeader`, `PageMenu`, `OrbitNav`.
- The header is `SiteHeader` in the root layout, so it stays mounted across navigations. Don't add another header to a page or to `(pages)/layout.tsx`. It is `h-14`, and `HomeHub` subtracts that height on desktop (`h-[calc(100dvh-3.5rem)]`) so home never scrolls: change both together.
- Never mark a whole section `"use client"` just to animate it. Wrap the animated part in `<Reveal>` or a dedicated client leaf, and pass server-rendered content as `children`.
- Props passed into Client Components must be serializable. Don't pass react-icons components (functions) or other non-serializable values across the boundary. Render the icon on the server side, or pass a string key and resolve it inside the client component (see how `HomeHub` strips `icon` before passing pages to `OrbitNav`).
- Import data from `src/data/` in Server Components and pass only what's needed down to client leaves.
- Any future code that uses secrets or server-only logic must `import "server-only"` and must never be imported from a `"use client"` file.

## Data and content

- `src/data/types.ts` is the content model. Every data file is typed against it (`Job`, `Project`, `Tech`, `Testimonial`, ...). Change the type first, then the data, then the components.
- Components never hardcode copy that belongs in data (names, links, project text, stats). Put it in `src/data/` and import it.
- Image paths in data are absolute from `/public` (e.g. `"/projects/foo.jpg"`). Optional fields (`logo`, `image`, `live`, `photo`) must have a sensible fallback in the UI.
- Testimonials flagged `placeholder: true` are not real reviews. Never present them as genuine, and never invent new testimonials, employers, metrics, or experience.

## Data fetching and caching (when it is added)

- The site is fully static today. Keep the page prerenderable.
- For any async data (GitHub API, CMS, etc.): put the fetch in a function in `src/data/` or `src/lib/`, add `"use cache"` plus a `cacheLife(...)` profile to it, and call it from a Server Component.
- Uncached or request-time data (`cookies()`, `headers()`, `searchParams`) must sit inside a `<Suspense>` boundary with a real fallback, so the static shell still prerenders.
- Use Server Actions (`"use server"`) for mutations such as a contact form, with input validation on the server. Don't add a Route Handler unless an external client needs an HTTP endpoint.
- Never use `export const dynamic`, `revalidate`, or `fetchCache` segment config. They belong to the old model.

## Styling

- Tailwind v4 utilities only. No CSS modules, styled-components, or inline `style` except for values computed at runtime.
- Palette is **warm pastel**. Use the design tokens from `globals.css`:
  - **All text uses `text-foreground`** (espresso in light mode, cream in dark mode). No `text-muted`/`text-accent` and no colour change on hover: show hover with borders, lift or underline instead. Hierarchy comes from size and weight.
  - UI shapes: `background`, `surface`, `border`, `accent` (sage: buttons, timeline, orbit dots, progress bar, hover borders, focus rings), `accent-soft` (tag/pill fills), `positive`. `muted` is kept in the tokens but not used for text.
  - Decoration only, never text (too light for contrast): `peach`, `butter`, `rose`, `sage`, and `glow-1/2/3` (the light behind the avatar: sun pastels in light mode, moonlight blues in dark mode).
  - Never hardcode hex or Tailwind palette colours (`bg-emerald-500` and the like) in components.
  - A new token goes in **three** places in `globals.css`: `:root`, `[data-theme="dark"]`, and the no-JS `prefers-color-scheme` fallback.
  - Any new text/background pair must pass **WCAG AA, 4.5:1** (3:1 for large text and UI shapes) in both themes. Measure it, don't eyeball it (see `LEARNING.md`, "Warm pastel palette").
- Dark mode is driven by `data-theme` on `<html>`, set by the inline script in `layout.tsx` before first paint. `dark:` variants follow that attribute, not `prefers-color-scheme`. Don't remove that script or `suppressHydrationWarning`.
- Layout: sections are `max-w-5xl` with `px-4 sm:px-6`. Design mobile-first and check that nothing scrolls horizontally at 360px.
- **One font for the whole app: Fraunces** (variable, `axes: ["SOFT", "opsz"]`), loaded with `next/font/google` in `layout.tsx` and mapped to `--font-sans`. `"SOFT" 100` is set on `<body>`. Don't add a second font (no mono, no display font) or `font-mono`/`font-serif` classes. Never use a `<link>` to Google Fonts.

## Animation

- Use Motion (`motion/react`), never `framer-motion` imports.
- Reuse `<Reveal>` for scroll-in effects before writing a new animation (it springs with a small overshoot; `x` slides sideways).
- Home page on desktop never scrolls: `OrbitNav` takes the wheel/trackpad/swipe (one step per gesture) and cancels it so Safari doesn't rubber-band. Don't add content that needs page scroll there at `lg` and up.
- Scroll-linked values (`useScroll` → `style`) are not covered by `MotionConfig reducedMotion`; check `useReducedMotion()` yourself (see `Timeline`).
- Theme switching disables all transitions for one frame (`data-theme-switching` in `ThemeToggle` + `globals.css`). Keep that so light/dark flips instantly.
- `MotionProvider` sets `reducedMotion="user"`. Keep every animation working with reduced motion: content must be visible and readable without the animation.
- Animate `opacity` and `transform` only. Don't animate layout properties.

## Images, icons, assets

- Use `next/image` for every image, with `width`/`height` (or `fill` + `sizes`) and a meaningful `alt` (`alt=""` only for decorative images). `priority` is deprecated in Next 16: for the above-the-fold hero image use `loading="eager"` or `fetchPriority="high"`, and leave every other image on the default lazy loading.
- The home hero is `PhotoReveal`: `avatar-illustration.webp` is shown, and `avatar.webp` (the real photo) shows through a circle under the pointer. The two files must have the **exact same canvas size and framing** (currently 1242×1253), and the photo box in `HomeHub` uses that aspect ratio. Replacing either image means re-aligning the other (see `LEARNING.md`, "New avatar images").
- Put assets in the matching `public/` subfolder. Keep project screenshots under ~300 KB; prefer `.jpg`/`.webp` for photos.
- Icons come from `react-icons` (`fi` for UI, `fa` for brands, `si` for tech logos). Don't add another icon library.

## Metadata and SEO

- Metadata is defined via the `metadata` export in `layout.tsx` and built from `src/data/profile.ts`. Don't use a manual `<head>`.
- Use file-based metadata (`opengraph-image`, `icon`, `sitemap.ts`, `robots.ts`) in `src/app/` per `14-metadata-and-og-images.md`.

## TypeScript and code style

- `strict` is on. No `any`, no `@ts-ignore`, no non-null `!` assertions on data that can actually be missing.
- Always import with the `@/` alias (`@/components/...`, `@/data/...`), except relative sibling imports inside the same folder.
- Named exports for components (`export function Hero()`). Default exports only where Next.js requires them (`page.tsx`, `layout.tsx`, metadata files).
- One component per file, PascalCase filename matching the component name.
- Use Next's global route types (`LayoutProps<"/">`, `PageProps<"/...">`) for route props instead of hand-written ones.
- Comment only non-obvious "why" decisions (see the theme script comment in `layout.tsx`).

## Accessibility

- Use semantic HTML: exactly one `<h1>` per page (your name on home, the `<Section>` title elsewhere), `<h2>` for sub-headings below it, `<nav>`, `<main>`, `<footer>`.
- Every icon-only link or button needs an `aria-label`. External links use `target="_blank" rel="noopener noreferrer"`.
- Interactive elements must be keyboard reachable with a visible focus style. Color contrast must pass WCAG AA in both themes.

## Definition of done

1. `npm run lint` and `npm run build` pass with no errors or new warnings.
2. No new blocking-route or instant-navigation insights in the dev overlay.
3. The change looks right in light and dark mode, on mobile and desktop widths, and with reduced motion enabled. On the home page, check the name stays readable where it crosses the illustration (it uses `text-outline`, a page-coloured outline).
4. If the running `next dev` keeps serving old server-rendered output after edits (hydration mismatch showing old markup), restart it. Don't delete `.next` while it runs.
5. Commit messages are short and in the imperative ("Add projects filter"), one logical change per commit.
