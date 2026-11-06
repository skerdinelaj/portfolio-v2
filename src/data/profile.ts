export const profile = {
  name: "Skerdi Nelaj",
  roles: ["Full Stack Developer", "AI Engineer", "React Native Developer", "WordPress Developer"],
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
    "Hey! Glad you made it here.",
    "I built this website to experiment, play with design and ideas, and see where they take me. It’s also where I share what I make, put my years of experience in motion, and show a bit of the person behind the code.",
    "It’s hard to sum myself up in one title. Developer, designer, AI engineer, ex-finance student who fell for code during COVID... all true. But at the end of the day, I just love turning messy ideas into things people actually enjoy using.",
    "Outside of work, I live with my headphones on, usually playing Albanian music (give it a try, you’ll be impressed), and I try to stay active. I’ve rewatched The Big Bang Theory more times than I’d like to admit, and I share my home with Melek, my cat, who i think loves more my keyboard than me.",
    "If any of this resonates with you, feel free to reach out. I’m always happy to meet new people and make new friends.",
  ],
  stats: [
    { value: 5, suffix: "+", label: "Years of experience" },
    { value: 40, suffix: "+", label: "Repositories" },
    { value: 10, suffix: "+", label: "Projects shipped" },
  ],
};
