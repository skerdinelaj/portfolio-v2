import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { Timeline, TimelineDot } from "@/components/ui/Timeline";
import { experience } from "@/data/experience";

export function Experience() {
  return (
    <Section eyebrow="Where I've worked" title="Experience">
      <Timeline>
        {experience.map((job, i) => (
          <li key={job.company} className="mb-10 ml-8 last:mb-0">
            <TimelineDot />
            <Reveal delay={i * 0.05} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  {job.role} · {job.company}
                  {job.companyNote && <span className="font-normal text-foreground"> ({job.companyNote})</span>}
                </h2>
                <span className="text-sm text-foreground">
                  {job.start} – {job.end}
                </span>
              </div>
              <ul className="mt-4 space-y-3">
                {job.highlights.map((h) => (
                  <li key={h.title}>
                    <p className="text-foreground">
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
      </Timeline>
    </Section>
  );
}
