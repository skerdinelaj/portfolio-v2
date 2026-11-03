import type { Project } from "./types";

// Featured = work case studies. Add screenshots to /public/projects (blur anything confidential).
export const projects: Project[] = [
  {
    slug: "ai-defense-builder",
    title: "AI Defense Builder",
    company: "Oracle Law Global",
    summary:
      "Generates legal defense drafts for flight-related cases. In testing, it cut drafting time per case from ~2 hours to 15–20 minutes.",
    tech: ["React", "TypeScript", "Python", "Claude API"],
    featured: true,
  },
  {
    slug: "okko",
    title: "Okko",
    company: "Okko (Freelance)",
    summary:
      "A social and jobs mobile app (chat, project ideas, job posts) with a Node.js microservices backend, built end-to-end.",
    tech: ["React Native", "Expo", "Node.js", "MongoDB", "PostgreSQL", "AWS"],
    featured: true,
  },
  {
    slug: "osgenic",
    title: "Osgenic",
    company: "Division 5",
    summary: "A 3D web game that challenges doctors to identify anatomical parts.",
    tech: ["React", "TypeScript", "Babylon.js"],
    featured: true,
  },
  {
    slug: "react-mentoring",
    title: "React Mentoring",
    summary: "Final project from a React mentoring program.",
    tech: ["React"],
    image: "/projects/kickstart-react.jpg",
    github: "https://github.com/skerdinelaj/react-mentoring-finish-project",
    live: "https://skerdinelaj.github.io/react-mentoring-finish-project/",
    featured: false,
  },
  {
    slug: "online-shop",
    title: "Online Shop",
    summary: "An e-commerce storefront.",
    tech: ["JavaScript"],
    image: "/projects/mocha-overcoat.jpg",
    github: "https://github.com/skerdinelaj/online-shop/",
    live: "https://skerdinelaj.github.io/online-shop/",
    featured: false,
  },
  {
    slug: "music-playlist",
    title: "Music Playlist",
    summary: "A music playlist app.",
    tech: ["JavaScript"],
    image: "/projects/music-playlist.png",
    github: "https://github.com/skerdinelaj/music-palylist",
    live: "https://skerdinelaj.github.io/music-palylist/",
    featured: false,
  },
];
