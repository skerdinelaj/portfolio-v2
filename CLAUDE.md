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
    (pages)/           Route group for scrolling pages (none at the moment): ScrollProgress + PageBar + <main> + Footer
      layout.tsx       ScrollProgress + PageBar + <main> + Footer for every inner page
    (fullscreen)/      Route group for one-screen pages (/about, /experience, /projects, /tech, /reviews, /contact): layout is PageBar + <main>, no Footer
    @modal/            Parallel-route slot rendered by the root layout: (.)contact = the contact popup (intercepted /contact);
                       page.tsx + [...catchAll] + default.tsx return null so the popup closes on any other route
    globals.css        Tokens, dark mode, theme-switch + overscroll rules
  components/
    sections/          One component per page / big block (SiteHeader, PageMenu, HomeHub, OrbitNav, About, Projects, ...)
    ui/                Reusable building blocks (Section, Reveal, PhotoReveal, GlassWindow, PopupWindow, OrbitEdge, ScrollProgress, ...)
  data/                Static content + types.ts (the content model). pages.ts lists the six pages
  lib/contact.ts       "use server": sendMessage Server Action (validates, then emails via Resend)
LEARNING.md            Learning journal: one entry per meaningful change (see Teaching mode)
public/                avatar.webp (cut-out photo), avatar-illustration.webp (aligned illustration), projects/, logos/, ...
```

- `src/app/` holds routing files only. Put components in `src/components/` and content in `src/data/`, not next to routes.
- A new page: add `src/app/(pages)/<slug>/page.tsx` (export `metadata` with a `title`), put its content in `components/sections/<Name>.tsx` wrapped in `<Section>` (scrolling pages; just width and padding), and add it to `src/data/pages.ts`. Its `label` there is the page's title: `PageBar` shows it as the page's `<h1>`, so pages render **no title of their own** (no eyebrow, no big heading). That one list feeds the home ring, the mobile card grid and the header Menu.
- Home page order and ring position come from the order in `pages.ts`.
- Ring cards and the phone page cards show no numbers, and there is no "01 / 06" counter (an `sr-only` live region announces the front page instead). Every card always renders its teaser and "Enter"; non-front cards keep them at `opacity-0` + `aria-hidden`, so turning to the front is an opacity crossfade with no size change. Keep it that way (no conditional rendering of card content).
- A component goes in `ui/` only when two or more sections use it, or it is a generic primitive. Otherwise keep it inside its section file.
- Deeper routes (e.g. `/projects/[slug]`) go inside the same route group as their parent page so they get its layout; keep `data/` as the source of truth.

## Server vs. Client Components

- Everything is a Server Component by default. Keep it that way.
- Add `"use client"` only to the smallest leaf that needs state, effects, event handlers, browser APIs, or Motion. Existing client leaves: `Reveal`, `MotionProvider`, `RoleCycler`, `CountUp`, `ThemeToggle`, `LiveClock`, `PhotoReveal`, `ScrollProgress`, `AutoHideHeader`, `PageMenu`, `OrbitNav`, `TechGlobe`, `ContactForm`, `ContactModal`, `OrbitEdge`, `AboutOrbit`, `Constellation`, `PopupWindow`, `ProjectWindows`, `QuoteOrbit`, `PageBar`.
- The header is `SiteHeader` in the root layout, so it stays mounted across navigations. Don't add another header to a page or to `(pages)/layout.tsx`. It is `h-14`, and `HomeHub` subtracts that height on desktop (`h-[calc(100dvh-3.5rem)]`) so home never scrolls: change both together.
- Every page except home has `PageBar` (`ui/`, client) under the header: the page's label from `pages.ts` on the left (the page's only `<h1>`), an "Esc · Home" link on the right, and the Esc key goes home. It's rendered by both route-group layouts and finds the page with `useSelectedLayoutSegment()`, not the URL (the contact popup sets the URL to `/contact` while the page underneath stays). It is `h-10`, so one-screen pages subtract header + bar = **6rem** (`TechGlobe`, `About`). Any other Esc handler (menu, popups) must call `e.preventDefault()` so the bar leaves that Esc alone; it also ignores Esc while a `<dialog>` is open or a field has focus.
- Never mark a whole section `"use client"` just to animate it. Wrap the animated part in `<Reveal>` or a dedicated client leaf, and pass server-rendered content as `children`.
- Props passed into Client Components must be serializable. Don't pass react-icons components (functions) or other non-serializable values across the boundary. Render the icon on the server side, or pass a string key and resolve it inside the client component (see how `HomeHub` strips `icon` before passing pages to `OrbitNav`).
- Import data from `src/data/` in Server Components and pass only what's needed down to client leaves.
- Any future code that uses secrets or server-only logic must `import "server-only"` and must never be imported from a `"use client"` file.

## Data and content

- `src/data/types.ts` is the content model. Every data file is typed against it (`Job`, `Project`, `Tech`, `Testimonial`, ...). Change the type first, then the data, then the components.
- Components never hardcode copy that belongs in data (names, links, project text, stats). Put it in `src/data/` and import it.
- Image paths in data are absolute from `/public` (e.g. `"/projects/foo.jpg"`). Optional fields (`logo`, `image`, `live`, `photo`) must have a sensible fallback in the UI.
- A colleague in `testimonials.ts` without a `quote` shows as "Review on its way". Only add a `quote` the person actually sent; never write one for them, and never invent testimonials, employers, metrics, or experience.
- Reference letters are quoted in full from the signed letters, minus contact details, addresses, registration numbers and signatures. Don't edit their wording. Only put a PDF in `/public/letters` once those private details are removed from it.

## Contact form (Server Action + Resend)

- **It's a popup.** Every `<Link href="/contact">` (SN menu, home ring, mobile cards) is intercepted by `app/@modal/(.)contact` and opens `ContactModal` over the current page; the URL is `/contact`, so back / Esc / backdrop click close it with `router.back()`. A full load of `/contact` renders the real page (`(fullscreen)/contact`, the same two cards floating in the middle). Never special-case `/contact` links in components; the route does it. There is no floating contact button (removed on request).
- The windows float (`motion-safe:animate-float` / `animate-float-slow` on a wrapper, never on the element Motion animates) and pause on hover or while focus is inside (`hover:` / `focus-within:[animation-play-state:paused]`). The popup focuses the dialog itself on open, not the first field, or the form window would never float.
- The popup is **two "celestial glass" windows, centred and top-aligned**: `GlassWindow` (`ui/`: glass card, `OrbitEdge` around it, header with title + ✕; no hooks, so server pages use it too) around the form (`ContactForm`: hairline rows TO / FROM / EMAIL / SUBJECT, the message, a sage pill) and around the links (`ContactLinks`: round icon bubbles; three tiles on phones). The form and links are passed into the client `ContactModal` as `children` and `links`; a sun/moon glow sits behind them. Closing the form window (✕ / Esc / backdrop) animates both out and *then* calls `router.back()`; the links window's ✕ only hides itself. Transient state is reset in a `useLayoutEffect` cleanup, because the closed popup stays mounted but hidden (see "Hidden pages").

- `ContactForm` (client, `useActionState`) posts to `sendMessage` in `src/lib/contact.ts` (`"use server"`). Validation lives on the server (anyone can POST to an action); a hidden `website` honeypot field silently drops bots.
- Mail goes through Resend's REST API with plain `fetch` (no SDK). The key is `RESEND_API_KEY` in `.env.local` (git-ignored) and in the Vercel project's env vars. Never prefix it with `NEXT_PUBLIC_`. `.env.example` documents it.
- Sender is `onboarding@resend.dev`, which only delivers to the Resend account's own address (`profile.email`). Sending from your own domain needs a verified domain in Resend.
- Without the key the form shows a friendly "email me directly" message and logs on the server.

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
  - Exception that lives in **data**, not components: brand logo colours (`color` on each `Tech` in `src/data/tech.ts`, passed to react-icons' `color` prop). Black logos have no `color` so they follow the text colour in dark mode.
  - A new token goes in **three** places in `globals.css`: `:root`, `[data-theme="dark"]`, and the no-JS `prefers-color-scheme` fallback.
  - Any new text/background pair must pass **WCAG AA, 4.5:1** (3:1 for large text and UI shapes) in both themes. Measure it, don't eyeball it (see `LEARNING.md`, "Warm pastel palette").
- Dark mode is driven by `data-theme` on `<html>`, set by the inline script in `layout.tsx` before first paint. `dark:` variants follow that attribute, not `prefers-color-scheme`. Don't remove that script or `suppressHydrationWarning`.
- **Card style: "celestial glass"** (contact, home, tech so far; the other pages will be redone with it). Use the `glass` utility (frosted `bg-surface/70` + blur, hairline `border-foreground/10`, a soft halo in `--glow-1`) for cards, `glass-lite` (no blur) for things that move every frame, and `paper` (same hairline and halo, 80% opaque, **no blur**) for the home ring cards. Never put `backdrop-blur` on anything inside an element whose opacity animates (the ring fades cards by depth): under an ancestor with opacity < 1 the blur switches off, so the look flickers between states. To fade a `GlassWindow`, animate the CSS variable `--window-opacity` on an ancestor (Motion can animate CSS variables); the window applies it to the glass itself (`opacity-(--window-opacity)`), and an element's own opacity doesn't disable its blur.
- Layout: sections are `max-w-5xl` with `px-4 sm:px-6`. Design mobile-first and check that nothing scrolls horizontally at 360px.
- **One font for the whole app: Fraunces** (variable, `axes: ["SOFT", "opsz"]`), loaded with `next/font/google` in `layout.tsx` and mapped to `--font-sans`. `"SOFT" 100` is set on `<body>`. Don't add a second font (no mono, no display font) or `font-mono`/`font-serif` classes. Never use a `<link>` to Google Fonts.

## Layering

- Global layers: header `z-50`, scroll progress `z-[60]`, contact popup `z-[70]`. Any component that uses its own z-index values internally (ring cards, globe icons) must sit inside an element with `isolate`, so those values only order its children and can never rise above the popup or header.

## Hidden pages (Cache Components + Activity)

- With `cacheComponents`, Next keeps up to 3 visited routes **in the DOM, hidden** (`display: none` via React `<Activity>`) instead of unmounting them; effects are cleaned up while hidden and re-run when shown (`node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`).
- So: never use global `html:has(...)` / `body:has(...)` rules keyed on page content (a hidden page still matches). Set a `data-*` attribute on `<html>` in a `useLayoutEffect` and remove it in the cleanup (see `data-orbit-lock` in `OrbitNav`).
- Transient UI (popups, success messages) should reset in a `useLayoutEffect` cleanup; DOM queries in tests must check visibility (`getClientRects().length`), not just existence.

## Animation

- Use Motion (`motion/react`), never `framer-motion` imports.
- Reuse `<Reveal>` for scroll-in effects before writing a new animation (it springs with a small overshoot; `x` slides sideways).
- `/tech` is just the globe: it lives in the `(fullscreen)` route group (no Footer, no progress bar) and the globe is `min(100dvh − 8rem, 100vw − 2rem)` wide. If you change the header or page bar height, re-check that the page height equals the window height.
- `/about` is one screen ("orbit of me"): the illustration on an `isolate` stage with the stats orbiting it (`AboutOrbit`: front half in front of the avatar, back half behind and faded; keeps orbiting on hover; positions set only in the browser), the bio in a `GlassWindow` with no title bar (no "About me" heading; the window itself is never inside a `Reveal`, its text is; on desktop the text box scrolls inside the window when it's taller than the space, with a bottom fade, `tabIndex={0}` + `role="region"` so keyboards can scroll it), and `Companies` as an endless belt of `glass-lite` pills in equal slots (5 across on xl, 4 lg, 3 md, 2 on phones; no gaps, so half the track is exactly one copy and the loop is seamless; it doesn't pause on hover). Phones stack it and may scroll a little.
- `/experience` is one screen ("constellation"): the jobs are stars, oldest → newest (the data is newest first, so `Experience` reverses it), joined by a dashed path; a sage line fills the path up to the star under the pointer / keyboard focus, and otherwise to the last job opened (a `stroke-dasharray` as long as the path to it). Clicking a star opens that job in a `PopupWindow` (see below) that grows out of the star's dot. `Constellation` (client) gets every job's popup content **pre-rendered on the server** as `panels` and only picks which one shows (the rest stay in the HTML, `hidden`). Job texts describe the role and the projects only: **no technology names or tags** (the user's choice). `Job.summary` (optional) is the "what I did there" intro. Absolute star `<li>`s carry the centring translate themselves (an untranslated positioned box widens the page on phones). The path is drawn in measured pixels (appears after hydration); the dust uses a seeded generator so server and client positions match. Labels use `Job.short` below `lg`; stars near the top (the peaks, `y < 40%`) put their label **above** the dot (CSS `order`, DOM order unchanged) so the path doesn't run through it.
- `PopupWindow` (`ui/`, client) is the shared "grow out of what you clicked" popup (Experience stars, Projects windows): a native `<dialog>` with `showModal()` (top layer above the header, page inert, Esc = `cancel`, intercepted to animate out first), our own animated backdrop + sun/moon glow inside it, and a `GlassWindow` faded via `--window-opacity`. The parent owns `open`, passes `origin` (a function returning the element to grow from; read at open and at close) and `onClosed`. It sets `transformOrigin` to that element's centre, measured against the window's untransformed wrapper, and animates only `scale`. It uses `useEffectEvent` so the parent's callbacks aren't effect dependencies; its effect cleanup also handles the page being hidden by `<Activity>`.
- `/projects` is one screen: a **Work · n / Learning · n** switch (ARIA tabs, ←/→, a Motion `layoutId` pill that slides) over a grid of floating windows of that kind (`Project.kind`: `"work"` = built at a company in `experience.ts`, shows the company; `"learning"` = the user's own learning projects, labelled "Learning project"; order in `projects.ts` is page order). Work is 4 columns, learning 3. The windows (`ProjectWindows`, client): `glass-lite` cards (they move every frame), a title bar with peach/butter/sage window dots, a screenshot or a sun/moon glow with the project's initial, one line. The bob is on the `<li>`, the hover lift on the `<article>` (both use `transform`). The real control is the `<button>` in the `<h2>` with a stretched `::after` (`z-10`, or the positioned picture box paints over it and swallows the click). Desktop picture height is `clamp(4rem, 50dvh − 18.75rem, 10rem)` so two rows plus the switch and page bar always fit; the title `<button>` itself is `block truncate` (an inline-block button can't receive the h2's ellipsis). Popup content (screenshot, story, **tech tags only here**, Live demo / Code pills) is server-rendered in `Projects` and passed as `panels`; card text has no tech names.
- `/reviews` is one screen on desktop ("quote orbit"): the avatar on an `isolate` stage with lines from the reference letters riding a tilted orbit around it (`QuoteOrbit`, client: the `AboutOrbit` technique, front half z-20 in front of the avatar's z-10, back half behind and faded; the orbit box covers only the avatar's square). Unlike About, it **pauses while a quote is hovered or focused** (you can't click a moving target). Clicking a quote, or a letter's name in the "Reference letters" row, opens the full letter in a `PopupWindow` growing from what you clicked. The quotes are `ReferenceLetter.highlights`: each **must be copied word for word from that letter's `body`** (check with a script). Phones get the quotes as a plain list under the avatar. Colleagues without a `quote` are dashed "review on its way" pills. Full letters are server-rendered in `Testimonials` and passed as `panels`. No `overflow-x-clip` on the section: it cut off quotes at the content edge; the orbit already limits itself to the window width.
- Contact is a **floating popup**, not a page you navigate to: see "Contact form" below.
- Home page on desktop never scrolls: `OrbitNav` takes the wheel/trackpad/swipe (one step per gesture) and cancels it so Safari doesn't rubber-band. Don't add content that needs page scroll there at `lg` and up.
- Scroll-linked values (`useScroll` → `style`) are not covered by `MotionConfig reducedMotion`; check `useReducedMotion()` yourself.
- Theme switching disables all transitions for one frame (`data-theme-switching` in `ThemeToggle` + `globals.css`). Keep that so light/dark flips instantly.
- `MotionProvider` sets `reducedMotion="user"`. Keep every animation working with reduced motion: content must be visible and readable without the animation.
- Animate `opacity` and `transform` only. Don't animate layout properties.

## Images, icons, assets

- Use `next/image` for every image, with `width`/`height` (or `fill` + `sizes`) and a meaningful `alt` (`alt=""` only for decorative images). `priority` is deprecated in Next 16: for the above-the-fold hero image use `loading="eager"` or `fetchPriority="high"`, and leave every other image on the default lazy loading.
- The home hero is `PhotoReveal`: `avatar-illustration.webp` is shown, and `avatar.webp` (the real photo) replaces it under the pointer (hover circle) and along brush strokes, scratch-card style: revealed areas **erase** the illustration rather than layering the photo over it. While anything is revealed a `<canvas>` draws both (illustration with `destination-out` holes + photo through the mask) and the illustration `<img>` is hidden via `data-active`; when idle the plain `<img>` shows (it keeps the alt text and `fetchPriority`). The two files must have the **exact same canvas size and framing** (currently 1242×1253), and the photo box in `HomeHub` uses that aspect ratio. Replacing either image means re-aligning the other (see `LEARNING.md`, "New avatar images").
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

- Use semantic HTML: exactly one `<h1>` per page (your name on home, the `PageBar` label elsewhere; window titles are `<h2>`), `<h2>` for sub-headings below it, `<nav>`, `<main>`, `<footer>`.
- Every icon-only link or button needs an `aria-label`. External links use `target="_blank" rel="noopener noreferrer"`.
- Interactive elements must be keyboard reachable with a visible focus style. Color contrast must pass WCAG AA in both themes.

## Definition of done

1. `npm run lint` and `npm run build` pass with no errors or new warnings.
2. No new blocking-route or instant-navigation insights in the dev overlay.
3. The change looks right in light and dark mode, on mobile and desktop widths, and with reduced motion enabled. On the home page, check the name stays readable where it crosses the illustration (it uses `text-outline`, a page-coloured outline).
4. If the running `next dev` keeps serving old server-rendered output after edits (hydration mismatch showing old markup), restart it. Don't delete `.next` while it runs.
5. Commit messages are short and in the imperative ("Add projects filter"), one logical change per commit.
