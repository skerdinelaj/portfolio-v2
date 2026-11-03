import { FaAws } from "react-icons/fa";
import {
  SiBootstrap,
  SiClaude,
  SiCss,
  SiExpo,
  SiExpress,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMui,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import type { TechGroup } from "./types";

export const techGroups: TechGroup[] = [
  {
    category: "Frontend",
    items: [
      { name: "React", icon: SiReact, level: "Experienced" },
      { name: "TypeScript", icon: SiTypescript, level: "Experienced" },
      { name: "JavaScript", icon: SiJavascript, level: "Experienced" },
      { name: "Redux", icon: SiRedux, level: "Experienced" },
      { name: "HTML5", icon: SiHtml5, level: "Experienced" },
      { name: "CSS / SCSS", icon: SiCss, level: "Experienced" },
      { name: "Tailwind", icon: SiTailwindcss, level: "Experienced" },
      { name: "Bootstrap", icon: SiBootstrap, level: "Experienced" },
      { name: "Material UI", icon: SiMui, level: "Experienced" },
    ],
  },
  {
    category: "Mobile",
    items: [{ name: "React Native / Expo", icon: SiExpo, level: "Experienced" }],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", icon: SiNodedotjs, level: "Experienced" },
      { name: "Express", icon: SiExpress, level: "Experienced" },
      { name: "MongoDB", icon: SiMongodb, level: "Intermediate" },
      { name: "PostgreSQL", icon: SiPostgresql, level: "Intermediate" },
    ],
  },
  {
    category: "Cloud & AI",
    items: [
      { name: "AWS", icon: FaAws, level: "Intermediate" },
      { name: "Python", icon: SiPython, level: "Intermediate" },
      { name: "Claude API", icon: SiClaude, level: "Intermediate" },
    ],
  },
];
