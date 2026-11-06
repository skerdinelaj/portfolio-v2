import Image from "next/image";
import { FiFileText } from "react-icons/fi";
import { QuoteOrbit } from "@/components/sections/reviews/QuoteOrbit";
import { Reveal } from "@/components/ui/Reveal";
import { profile } from "@/data/profile";
import { letterNote, referenceLetters, testimonials } from "@/data/testimonials";

const label = "text-xs font-semibold tracking-widest uppercase";

/**
 * One-screen Reviews page ("quote orbit"): lines from the signed reference letters orbit the avatar; clicking one
 * opens the whole letter in a popup. Below: the letters by name (the same popups, for anyone who'd rather not chase a
 * moving quote) and the colleagues whose reviews are on their way.
 * The full letters are rendered here on the server and handed to the client `QuoteOrbit` as `panels`, so their text
 * is in the HTML and none of it is client code.
 * A colleague without a `quote` is shown as "review on its way": their words are never written for them.
 */
export function Testimonials() {
  // Interleave the letters around the ring (A1 B1 A2 B2 …) so neighbouring quotes come from different people
  const quotes = referenceLetters
    .flatMap((l, letter) => l.highlights.map((text, k) => ({ text, author: l.author, letter, k })))
    .sort((a, b) => a.k - b.k || a.letter - b.letter)
    .map(({ text, author, letter }) => ({ text, author, letter }));

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-4 px-4 py-4 sm:px-6">
      {/* Stage: glow, avatar and the orbiting quotes share one stacking context (`isolate`), so the quotes'
          z-index (behind / in front) interleaves with the avatar's z-10 */}
      <Reveal>
        <div className="relative isolate mx-auto w-[min(100%,calc(100dvh-15rem))] min-w-64">
          <div className="relative aspect-square">
            <div
              aria-hidden
              className="absolute inset-[14%] rounded-full bg-linear-to-br from-glow-1 via-glow-2 to-glow-3 opacity-80 blur-3xl"
            />
            <Image
              src={profile.illustration}
              alt={profile.name}
              fill
              sizes="(min-width: 768px) 40rem, 80vw"
              className="pointer-events-none z-10 object-contain object-bottom"
            />
          </div>
          <QuoteOrbit
            quotes={quotes}
            authors={referenceLetters.map((l) => l.author)}
            panels={referenceLetters.map((l) => (
              <article key={l.slug}>
                <p className="text-sm sm:text-base">
                  <span className="font-semibold">
                    {l.role}, {l.company}
                  </span>{" "}
                  · {l.date}
                </p>
                <p className="mt-1 text-sm">{l.relation}</p>
                <div className="mt-6 space-y-6 text-base leading-relaxed">
                  {l.body.map((part, si) => (
                    <section key={si}>
                      {part.heading && <h3 className={`${label} mb-2`}>{part.heading}</h3>}
                      <div className="space-y-3">
                        {part.paragraphs.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                <p className="mt-6 border-l-2 border-accent/50 pl-4 italic">
                  {l.author}, {l.role}
                </p>
                <p className="mt-6 border-t border-foreground/10 pt-4 text-xs">{letterNote}</p>
                {l.pdf && (
                  <a
                    href={l.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <FiFileText aria-hidden /> Open the PDF
                  </a>
                )}
              </article>
            ))}
          />
        </div>
      </Reveal>

      {/* Colleagues: a quote appears only once they've sent their own words */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <h2 className={`${label} mr-1`}>Colleagues</h2>
        {testimonials.map((t) =>
          t.quote ? (
            <figure key={t.name} className="glass-lite max-w-md rounded-2xl px-4 py-3">
              <blockquote className="italic">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-1 text-xs font-semibold">
                · {t.name}, {t.companies.join(" · ")}
              </figcaption>
            </figure>
          ) : (
            <p
              key={t.name}
              className="flex items-center gap-2 rounded-full border border-dashed border-foreground/25 px-3 py-1.5"
            >
              {t.photo && (
                <Image src={t.photo} alt="" width={24} height={24} className="size-6 rounded-full object-cover" />
              )}
              <span className="font-semibold">{t.name}</span>
              <span className="text-xs italic">· review on its way</span>
            </p>
          ),
        )}
      </div>
    </section>
  );
}
