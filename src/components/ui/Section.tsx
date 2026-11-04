import { Reveal } from "./Reveal";

/** Page wrapper with the page's eyebrow and <h1> title. Use once per page. */
export function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 md:py-20">
      <Reveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-foreground">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      </Reveal>
      {children}
    </section>
  );
}
