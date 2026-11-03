import Image from "next/image";
import { FiFileText } from "react-icons/fi";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { referenceLetters, testimonials } from "@/data/testimonials";

const placeholderStyle = "border-dashed opacity-60";

export function Testimonials() {
  return (
    <Section eyebrow="What people say" title="Reviews & references">
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <figure className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-6 ${t.placeholder ? placeholderStyle : ""}`}>
              <span className="text-4xl leading-none text-accent" aria-hidden>
                &ldquo;
              </span>
              <blockquote className="mt-2 flex-1 text-muted">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                {t.photo ? (
                  <Image src={t.photo} alt={t.name} width={40} height={40} className="size-10 rounded-full object-cover" />
                ) : (
                  <div className="grid size-10 place-items-center rounded-full bg-accent-soft font-semibold text-accent">{t.name[0]}</div>
                )}
                <div className="text-sm">
                  {t.linkedin ? (
                    <a href={t.linkedin} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-accent">
                      {t.name}
                    </a>
                  ) : (
                    <p className="font-semibold">{t.name}</p>
                  )}
                  <p className="text-muted">
                    {t.role}, {t.company}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <h2 className="mt-16 mb-6 text-center text-xl font-semibold">Reference letters</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {referenceLetters.map((l, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <article className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-6 ${l.placeholder ? placeholderStyle : ""}`}>
              <FiFileText className="size-6 text-accent" aria-hidden />
              <p className="mt-4 flex-1 italic text-muted">&ldquo;{l.excerpt}&rdquo;</p>
              <p className="mt-4 text-sm">
                <span className="font-semibold">{l.author}</span>
                <span className="text-muted">
                  {" "}
                  · {l.role}, {l.company}
                </span>
              </p>
              {l.pdf && (
                <a href={l.pdf} target="_blank" rel="noopener noreferrer" className="mt-4 self-start rounded-full border border-border px-4 py-1.5 text-sm transition hover:border-accent hover:text-accent">
                  Read full letter (PDF)
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
