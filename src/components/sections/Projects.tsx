import Image from "next/image";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { Tag } from "@/components/ui/Tag";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";

function ProjectLinks({ p }: { p: Project }) {
  return (
    <div className="mt-4 flex gap-4 text-sm">
      {p.github && (
        <a href={p.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted hover:text-accent">
          <FiGithub /> Code
        </a>
      )}
      {p.live && (
        <a href={p.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-muted hover:text-accent">
          <FiExternalLink /> Live demo
        </a>
      )}
    </div>
  );
}

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const side = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" eyebrow="What I've built" title="Projects">
      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-video overflow-hidden bg-accent-soft">
                {p.image ? (
                  <Image src={p.image} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-accent">Screenshot coming soon</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                {p.company && <p className="text-xs font-medium uppercase tracking-wider text-accent">{p.company}</p>}
                <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
                <ProjectLinks p={p} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <h3 className="mt-16 mb-6 text-center text-xl font-semibold">Side projects</h3>
      <div className="grid gap-6 sm:grid-cols-3">
        {side.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <article className="group overflow-hidden rounded-2xl border border-border bg-surface">
              {p.image && (
                <div className="relative aspect-video overflow-hidden">
                  <Image src={p.image} alt={p.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold">{p.title}</h4>
                <ProjectLinks p={p} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
