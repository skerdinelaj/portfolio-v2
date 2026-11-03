@AGENTS.md

# Portfolio v2: project rules

Personal portfolio: a one-screen home hub plus six content pages. Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript (strict), Tailwind CSS v4, Motion, react-icons. No backend, database, or CMS: all content is static TypeScript in `src/data/`.

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
    layout.tsx         Root: <html>, fonts, theme script, MotionProvider
    page.tsx           Home hub (renders HomeHub). One screen, no Navbar/Footer
    (pages)/           Route group for /about /experience /tech /projects /reviews /contact
      layout.tsx       ScrollProgress + Navbar + <main> + Footer for every inner page
    globals.css        Tokens, dark mode, PhotoReveal + theme-switch + overscroll rules
  components/
    sections/          One component per page / big block (HomeHub, OrbitNav, Navbar, About, Projects, ...)
    ui/                Reusable building blocks (Section, Reveal, PhotoReveal, Timeline, ScrollProgress, ...)
  data/                Static content + types.ts (the content model). pages.ts lists the six pages
public/                profile.webp (cut-out photo), profile-2d.webp (ink-only line drawing), projects/, logos/, ...
```

- `src/app/` holds routing files only. Put components in `src/components/` and content in `src/data/`, not next to routes.
- A new page: add `src/app/(pages)/<slug>/page.tsx` (export `metadata` with a `title`), put its content in `components/sections/<Name>.tsx` wrapped in `<Section eyebrow title>` (renders the page's single `<h1>`), and add it to `src/data/pages.ts`. That one list feeds the home ring, the mobile card grid and the Navbar.
- Home page order and ring position come from the order in `pages.ts`.
- A component goes in `ui/` only when two or more sections use it, or it is a generic primitive. Otherwise keep it inside its section file.
- Deeper routes (e.g. `/projects/[slug]`) go inside `(pages)/` so they get the shared layout; keep `data/` as the source of truth.

## Server vs. Client Components

- Everything is a Server Component by default. Keep it that way.
- Add `"use client"` only to the smallest leaf that needs state, effects, event handlers, browser APIs, or Motion. Existing client leaves: `Reveal`, `MotionProvider`, `RoleCycler`, `CountUp`, `ThemeToggle`, `LiveClock`, `PhotoReveal`, `Timeline`, `ScrollProgress`, `Navbar`, `OrbitNav`.
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
- Use the design tokens from `globals.css` (`bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `text-accent`, `bg-accent-soft`). Never hardcode hex colors in components. Add a new token to both `:root` and `[data-theme="dark"]` when one is needed.
- Dark mode is driven by `data-theme` on `<html>`, set by the inline script in `layout.tsx` before first paint. `dark:` variants follow that attribute, not `prefers-color-scheme`. Don't remove that script or `suppressHydrationWarning`.
- Layout: sections are `max-w-5xl` with `px-4 sm:px-6`. Design mobile-first and check that nothing scrolls horizontally at 360px.
- Fonts come from `next/font/google` (Geist, Geist Mono) via CSS variables. Never use a `<link>` to Google Fonts.

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
3. The change looks right in light and dark mode, on mobile and desktop widths, and with reduced motion enabled. Check light mode explicitly on the home page: the name's `mix-blend-difference` breaks silently if any wrapper between it and the `isolate` box gets a z-index or opacity.
4. If the running `next dev` keeps serving old server-rendered output after edits (hydration mismatch showing old markup), restart it. Don't delete `.next` while it runs.
5. Commit messages are short and in the imperative ("Add projects filter"), one logical change per commit.
