import Image from "next/image";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import { ProjectWindows } from "@/components/sections/ProjectWindows";
import { Tag } from "@/components/ui/Tag";
import { projects } from "@/data/projects";

const linkPill =
  "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * One-screen Projects page: a Work / Learning switch, then every project of that kind as a small floating window; clicking one opens it in a popup that grows out
 * of the window. Each project's popup content (screenshot, story, tech, links) is rendered here on the server and
 * handed to the client `ProjectWindows` as `panels`, so all of it is in the HTML and none of it is client code.
 */
export function Projects() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 [@media(min-height:880px)]:py-6">
      <ProjectWindows
        cards={projects.map(({ slug, title, company, summary, image, kind }) => ({
          slug,
          title,
          company,
          summary,
          image,
          kind,
        }))}
        panels={projects.map((p) => (
          <div key={p.slug}>
            <p className="text-xs font-semibold tracking-widest uppercase">{p.company ?? "Learning project"}</p>
            {p.image && (
              // Its own shape, not a fixed 16:9 box: screenshots come in different widths, and cropping would cut
              // parts of them off. width/height only reserve space until the file loads; h-auto then uses the real
              // proportions.
              <Image
                src={p.image}
                alt={`Screenshot of ${p.title}`}
                width={1600}
                height={900}
                sizes="(min-width: 768px) 46rem, 100vw"
                className="mt-3 h-auto w-full rounded-2xl border border-foreground/10"
              />
            )}
            <p className="mt-4 text-base leading-relaxed sm:text-lg">{p.summary}</p>
            <h3 className="mt-6 text-xs font-semibold tracking-widest uppercase">Built with</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.tech.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            {(p.live || p.github) && (
              <div className="mt-6 flex flex-wrap gap-3">
                {p.live && (
                  <a
                    href={p.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkPill} bg-accent text-white shadow-[0_12px_28px_-12px_var(--accent)] dark:text-background`}
                  >
                    <FiExternalLink aria-hidden /> {p.kind === "work" ? "Visit site" : "Live demo"}
                  </a>
                )}
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkPill} border border-foreground/15 hover:border-accent hover:bg-accent-soft`}
                  >
                    <FiGithub aria-hidden /> Code
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      />
    </section>
  );
}
