/** Page wrapper for scrolling pages: width and padding only. The page's title (its <h1>) is in `PageBar`. */
export function Section({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">{children}</section>;
}
