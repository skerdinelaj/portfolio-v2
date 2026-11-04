import Image from "next/image";
import { experience } from "@/data/experience";

export function Companies() {
  // Duplicated so the strip can loop seamlessly
  const items = [...experience, ...experience];

  return (
    <section aria-label="Companies I've worked with" className="border-y border-border bg-surface py-8">
      <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-foreground">
        Companies I&apos;ve worked with
      </p>
      <div className="marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-16">
          {items.map((job, i) => (
            <li key={i} aria-hidden={i >= experience.length} className="flex h-10 items-center">
              {job.logo ? (
                <Image src={job.logo} alt={job.company} width={120} height={40} className="h-8 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              ) : (
                <span className="whitespace-nowrap text-lg font-semibold text-foreground">{job.company}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
