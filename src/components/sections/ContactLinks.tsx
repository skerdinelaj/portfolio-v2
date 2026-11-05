import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { profile } from "@/data/profile";

/**
 * The links window's rows: an icon in a round bubble and the name. On phones they become three compact tiles side
 * by side so the popup fits small screens. Server Component (react-icons are functions, so they're rendered here and
 * the client popup receives the finished markup).
 */
export function ContactLinks() {
  const links = [
    { href: profile.linkedin, label: "LinkedIn", icon: FaLinkedin },
    { href: profile.github, label: "GitHub", icon: FaGithub },
    { href: `mailto:${profile.email}`, label: "Email", icon: FiMail },
  ];

  return (
    <ul className="grid grid-cols-3 gap-1 p-2 sm:block sm:space-y-1">
      {links.map(({ href, label, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 text-center transition-colors hover:bg-accent-soft/60 focus-visible:bg-accent-soft/60 focus-visible:outline-2 focus-visible:outline-accent sm:flex-row sm:gap-3 sm:px-4 sm:py-2.5 sm:text-left"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-foreground/15 bg-surface shadow-[0_6px_16px_-8px_var(--glow-1)] transition group-hover:scale-110 group-hover:border-accent sm:size-10" aria-hidden>
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-semibold sm:text-base">{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
