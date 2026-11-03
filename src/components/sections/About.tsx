import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { profile } from "@/data/profile";

export function About() {
  return (
    <Section id="about" eyebrow="Get to know me" title="About me">
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
        <Reveal className="space-y-4 text-lg leading-relaxed text-muted">
          {profile.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Reveal>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-1">
          {profile.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="rounded-2xl border border-border bg-surface p-5 text-center md:w-48">
              <div className="text-3xl font-bold text-accent">
                <CountUp to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
