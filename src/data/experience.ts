import type { Job } from "./types";

// Add logos to /public/logos and set `logo` on each job.
export const experience: Job[] = [
  {
    company: "Oracle Law Global",
    companyNote: "formerly Oracle Solicitors",
    role: "Full Stack Developer",
    start: "June 2024",
    end: "Present",
    highlights: [
      {
        title: "AI Defense Builder",
        text: "Worked on software that automatically generates legal defense drafts for flight-related cases. In testing, it cut estimated drafting time per case from ~2 hours to 15–20 minutes.",
        tech: ["React", "TypeScript", "Python", "Claude API"],
      },
      {
        title: "Rebooking",
        text: "Built a tool giving lawyers access to historical flight data to support cases involving disrupted flights.",
      },
      {
        title: "Oracle Law Global rebrand",
        text: "Led the rebrand and rebuilt the firm's website. I manage its hosting, SSL/DNS, SEO and GDPR compliance.",
        tech: ["WordPress", "Elementor"],
      },
      {
        title: "Workflow automation",
        text: "Automated a manual data analyst workflow with a Python script that distributes incoming cases evenly across employees.",
        tech: ["Python"],
      },
    ],
  },
  {
    company: "Okko",
    companyNote: "Freelance",
    role: "Full Stack Developer",
    start: "November 2025",
    end: "September 2026",
    highlights: [
      {
        title: "Okko app",
        text: "Built a mobile app end-to-end where users chat, share project ideas, post and browse open jobs, and connect with other people, integrated with the backend over REST APIs.",
        tech: ["React Native", "Expo"],
      },
      {
        title: "Okko backend",
        text: "Built the backend with JWT/bcrypt authentication, in a microservices architecture on AWS/CodeArtifact.",
        tech: ["Node.js", "Express", "MongoDB", "PostgreSQL", "AWS"],
      },
    ],
  },
  {
    company: "Division 5",
    role: "Front-End Developer",
    start: "January 2023",
    end: "June 2024",
    highlights: [
      {
        title: "Circular Fashion",
        text: "Implemented new features and ongoing support for a platform where users sell, swap, or donate used clothing.",
        tech: ["React", "Redux", "JavaScript", "SCSS"],
      },
      {
        title: "Osgenic",
        text: "Built a gaming web app challenging doctors to identify anatomical parts.",
        tech: ["React", "TypeScript", "Babylon.js"],
      },
    ],
  },
  {
    company: "Engage Technology",
    role: "Front-End Developer",
    start: "June 2022",
    end: "December 2022",
    highlights: [
      {
        title: "Binschonda",
        text: "Shipped new features and bug fixes for a web app providing everyday task support for elderly users.",
        tech: ["React", "JavaScript", "React Router", "Axios", "Tailwind"],
      },
    ],
  },
  {
    company: "Linfa SH.P.K",
    role: "Front-End Developer",
    start: "April 2021",
    end: "May 2022",
    highlights: [
      {
        title: "CQS",
        text: "Built an application allowing bank employees to take out payroll-deducted loans.",
        tech: ["C#", "Bootstrap"],
      },
      {
        title: "LSS",
        text: "Built a recruiting platform matching open roles to company needs.",
        tech: ["React", "Redux", "TypeScript", "SCSS", "Material UI"],
      },
    ],
  },
];
