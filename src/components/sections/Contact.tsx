import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { profile } from "@/data/profile";

export function Contact() {
  const links = [
    { href: `mailto:${profile.email}`, label: profile.email, icon: FiMail },
    { href: profile.linkedin, label: "LinkedIn", icon: FaLinkedin },
    { href: profile.github, label: "GitHub", icon: FaGithub },
  ];

  return (
    <Section id="contact" eyebrow="Let's work together" title="Get in touch">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-muted">Open to new roles and freelance projects. The fastest way to reach me is email.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm transition hover:border-accent hover:text-accent"
            >
              <Icon className="size-4" /> {label}
            </a>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
