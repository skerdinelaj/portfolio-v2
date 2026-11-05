import Image from "next/image";
import { FiFileText } from "react-icons/fi";
import { LetterWindows } from "@/components/sections/LetterWindows";
import { letterNote, referenceLetters, testimonials } from "@/data/testimonials";

const label = "text-xs font-semibold tracking-widest uppercase";

/**
 * One-screen Reviews page: the signed reference letters as floating glass letters (click one to read it whole in a
 * popup), then the colleagues. The full letters are rendered here on the server and handed to the client
 * `LetterWindows` as `panels`, so their text is in the HTML and none of it is client code.
 * A colleague without a `quote` is shown as "review on its way": their words are never written for them.
 */
export function Testimonials() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-4 py-6 sm:px-6 lg:gap-10">
      <div>
        <h2 className={`${label} mb-4 text-center`}>Reference letters</h2>
        <LetterWindows
          letters={referenceLetters.map(({ slug, author, role, company, date, excerpt }) => ({
            slug,
            author,
            role,
            company,
            date,
            excerpt,
          }))}
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
                {l.body.map((section, si) => (
                  <section key={si}>
                    {section.heading && <h3 className={`${label} mb-2`}>{section.heading}</h3>}
                    <div className="space-y-3">
                      {section.paragraphs.map((p) => (
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

      <div>
        <h2 className={`${label} mb-4 text-center`}>Colleagues</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.name}>
              <figure
                className={`flex h-full flex-col rounded-2xl p-4 ${t.quote ? "glass-lite" : "border border-dashed border-foreground/20 bg-surface/40"}`}
              >
                {t.quote && <blockquote className="mb-4 flex-1 italic">&ldquo;{t.quote}&rdquo;</blockquote>}
                <figcaption className="flex items-center gap-3">
                  {t.photo ? (
                    <Image src={t.photo} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span
                      aria-hidden
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold"
                    >
                      {t.name[0]}
                    </span>
                  )}
                  <div className="min-w-0 text-sm">
                    <h3 className="font-semibold">
                      {t.linkedin ? (
                        <a
                          href={t.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 hover:underline"
                        >
                          {t.name}
                        </a>
                      ) : (
                        t.name
                      )}
                    </h3>
                    <p>
                      {t.role && <>{t.role} · </>}
                      {t.companies.join(" · ")}
                    </p>
                    {!t.quote && <p className="mt-0.5 text-xs italic">Review on its way</p>}
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
