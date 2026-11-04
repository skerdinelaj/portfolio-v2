import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { techGroups } from "@/data/tech";

export function TechStack() {
  return (
    <Section eyebrow="What I work with" title="Tech stack">
      <div className="grid gap-6 sm:grid-cols-2">
        {techGroups.map((group, gi) => (
          <Reveal key={group.category} delay={gi * 0.08} className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-semibold">{group.category}</h2>
            <ul className="grid grid-cols-2 gap-3">
              {group.items.map(({ name, icon: Icon, level }) => (
                <li key={name} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-accent-soft">
                  <Icon className="size-6 shrink-0 text-foreground transition group-hover:scale-110" aria-hidden />
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-foreground">{level}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
