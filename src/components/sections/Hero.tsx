import Image from "next/image";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Reveal } from "@/components/ui/Reveal";
import { RoleCycler } from "@/components/ui/RoleCycler";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col-reverse items-center gap-10 px-4 pt-16 pb-12 sm:px-6 md:flex-row md:justify-between md:pt-24">
      <Reveal className="text-center md:text-left">
        <p className="text-muted">Hello, I&apos;m</p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-6xl">{profile.name}</h1>
        <p className="mt-3 text-xl font-medium sm:text-2xl">
          <RoleCycler roles={profile.roles} />
        </p>
        <p className="mx-auto mt-5 max-w-md text-muted md:mx-0">{profile.tagline}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <a
            href="#contact"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 dark:text-background"
          >
            Contact me
          </a>
          <a
            href="#projects"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            See my work
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 text-muted transition hover:text-foreground">
            <FaGithub className="size-6" />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 text-muted transition hover:text-foreground">
            <FaLinkedin className="size-6" />
          </a>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <Image
          src={profile.photo}
          alt={profile.name}
          width={320}
          height={320}
          priority
          className="size-56 rounded-full border-4 border-surface object-cover shadow-xl ring-1 ring-border sm:size-72"
        />
      </Reveal>
    </section>
  );
}
