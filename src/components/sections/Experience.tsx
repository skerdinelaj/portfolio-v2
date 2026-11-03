import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { experience } from "@/data/experience";

export function Experience() {
  return (
    <Section id="experience" eyebrow="Where I've worked" title="Experience">
      <ol className="relative ml-3 border-l border-border">
        {experience.map((job, i) => (
          <li key={job.company} className="mb-10 ml-8 last:mb-0">
            <span className="absolute -left-[7px] mt-2 size-3.5 rounded-full border-2 border-background bg-accent" />
            <Reveal delay={i * 0.05} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold">
                  {job.role} · {job.company}
                  {job.companyNote && <span className="font-normal text-muted"> ({job.companyNote})</span>}
                </h3>
                <span className="text-sm text-muted">
                  {job.start} – {job.end}
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {job.highlights.map((h) => (
                  <li key={h.title}>
                    <p className="text-muted">
                      <strong className="text-foreground">{h.title}:</strong> {h.text}
                    </p>
                    {h.tech && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {h.tech.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
