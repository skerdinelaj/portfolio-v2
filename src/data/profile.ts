export const profile = {
  name: "Skerdi Nelaj",
  roles: ["Full Stack Developer", "React & TypeScript Developer", "React Native Developer", "AI Integrations"],
  tagline: "I build React and AI-powered products end-to-end, from UI to API to deployment.",
  email: "nskerdi@gmail.com",
  linkedin: "https://www.linkedin.com/in/skerdi-nelaj-289b651b7/",
  github: "https://github.com/skerdinelaj",
  /** Cut-out photo, revealed under the pointer on the home page */
  photo: "/avatar.webp",
  /** Illustration of the same pose, shown by default. Must keep the exact same canvas (1242×1253) as `photo`. */
  illustration: "/avatar-illustration.webp",
  /** Shown in the home top bar. Set to null to hide it. */
  status: "Open to work" as string | null,
  about: [
    "Full stack developer with 5+ years of experience building production React and TypeScript applications.",
    "At Okko I built a React Native / Expo social and jobs app together with its Node.js/Express backend (MongoDB, PostgreSQL). I bring strong React fundamentals (Redux, component architecture, API integration) to web and mobile, and deliver features end-to-end, including LLM-based features built on the Claude API.",
  ],
  stats: [
    { value: 5, suffix: "+", label: "Years of experience" },
    { value: 5, suffix: "", label: "Companies" },
    { value: 10, suffix: "+", label: "Projects shipped" },
  ],
};
