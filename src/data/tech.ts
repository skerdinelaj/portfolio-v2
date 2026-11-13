import { FaAws } from "react-icons/fa";
import {
  SiAngular,
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
      { name: "React", icon: SiReact, level: "Experienced", color: "#149eca" },
      { name: "Angular", icon: SiAngular, level: "Intermediate", color: "#dd0031" },
      { name: "TypeScript", icon: SiTypescript, level: "Experienced", color: "#3178c6" },
      { name: "JavaScript", icon: SiJavascript, level: "Experienced", color: "#e8c600" },
      { name: "Redux", icon: SiRedux, level: "Experienced", color: "#764abc" },
      { name: "HTML5", icon: SiHtml5, level: "Experienced", color: "#e34f26" },
      { name: "CSS / SCSS", icon: SiCss, level: "Experienced", color: "#1572b6" },
      { name: "Tailwind", icon: SiTailwindcss, level: "Experienced", color: "#06b6d4" },
      { name: "Bootstrap", icon: SiBootstrap, level: "Experienced", color: "#7952b3" },
      { name: "Material UI", icon: SiMui, level: "Experienced", color: "#007fff" },
    ],
  },
  {
    category: "Mobile",
    items: [{ name: "React Native / Expo", icon: SiExpo, level: "Experienced" }],
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", icon: SiNodedotjs, level: "Experienced", color: "#5fa04e" },
      { name: "Express", icon: SiExpress, level: "Experienced" },
      { name: "MongoDB", icon: SiMongodb, level: "Intermediate", color: "#47a248" },
      { name: "PostgreSQL", icon: SiPostgresql, level: "Intermediate", color: "#4169e1" },
    ],
  },
  {
    category: "Cloud & AI",
    items: [
      { name: "AWS", icon: FaAws, level: "Intermediate", color: "#ff9900" },
      { name: "Python", icon: SiPython, level: "Intermediate", color: "#3776ab" },
      { name: "Claude API", icon: SiClaude, level: "Intermediate", color: "#d97757" },
    ],
  },
];
