import { Reveal } from "./Reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6">
      <Reveal className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      </Reveal>
      {children}
    </section>
  );
}
