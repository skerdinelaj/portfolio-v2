import type { Job } from "./types";

// Add logos to /public/logos and set `logo` on each job.
export const experience: Job[] = [
  {
    company: "Oracle Law Global",
    short: "Oracle Law",
    companyNote: "formerly Oracle Solicitors",
    role: "Full Stack Developer",
    start: "June 2024",
    end: "Present",
    summary: [
      "Oracle Law Global, formerly Oracle Solicitors, is a law firm whose work includes cases about disrupted flights. I joined in June 2024 as a Full Stack Developer, my first full-stack role after three years on the front end, and I’m still there today.",
      "My job is to build the tools the firm runs on. That ranges from software that drafts legal defenses with AI, to a tool that lets lawyers look up historical flight data, to automating the way new cases are shared out across the team. I also look after the firm’s public face: I led the rebrand from Oracle Solicitors to Oracle Law Global, rebuilt the website, and still take care of its hosting, domains, SEO and GDPR compliance.",
    ],
    highlights: [
      {
        title: "AI Defense Builder",
        text: "Worked on software that automatically generates legal defense drafts for flight-related cases. In testing, it cut estimated drafting time per case from ~2 hours to 15–20 minutes.",
      },
      {
        title: "Rebooking",
        text: "Built a tool giving lawyers access to historical flight data to support cases involving disrupted flights.",
      },
      {
        title: "Oracle Law Global rebrand",
        text: "Led the rebrand and rebuilt the firm's website. I manage its hosting, SSL/DNS, SEO and GDPR compliance.",
      },
      {
        title: "Workflow automation",
        text: "Automated a manual data analyst workflow with a script that distributes incoming cases evenly across employees.",
      },
    ],
  },
  {
    company: "Okko",
    companyNote: "Freelance",
    role: "Full Stack Developer",
    start: "November 2025",
    end: "September 2026",
    summary: [
      "Okko is a place for people who want to build things together: they chat, share project ideas, post and find open jobs, and connect with each other. I worked on it as a freelancer from November 2025 to September 2026, alongside my role at Oracle Law Global.",
      "It was a full-stack job in the truest sense. I built the mobile app from start to finish, and the backend behind it: secure sign-up and login, and a set of small, independent services running in the cloud.",
    ],
    highlights: [
      {
        title: "Okko app",
        text: "Built a mobile app end-to-end where users chat, share project ideas, post and browse open jobs, and connect with other people.",
      },
      {
        title: "Okko backend",
        text: "Built the backend behind the app: secure sign-up and login, split into small independent services running in the cloud.",
      },
    ],
  },
  {
    company: "Division 5",
    role: "Front-End Developer",
    start: "January 2023",
    end: "June 2024",
    summary: [
      "I joined Division 5 in January 2023 as a Front-End Developer and stayed for a year and a half, until June 2024, working on two very different products.",
      "Circular Fashion helps fashion brands design and certify circular products: I built new features and gave ongoing support on its platform where people sell, swap or donate clothes they no longer wear. Osgenic was something else entirely, an educational platform for orthopaedics and traumatology, where I built a 3D web game that challenges doctors to identify anatomical parts.",
    ],
    highlights: [
      {
        title: "Circular Fashion",
        text: "A company helping fashion brands design and certify circular products. I built new features and gave ongoing support on its platform where users sell, swap or donate used clothing.",
      },
      {
        title: "Osgenic",
        text: "An educational platform for orthopaedics and traumatology. I built its 3D web game that challenges doctors to identify anatomical parts.",
      },
    ],
  },
  {
    company: "Engage Technology",
    short: "Engage",
    role: "Front-End Developer",
    start: "June 2022",
    end: "December 2022",
    summary: [
      "Engage Technology was my second front-end role. I spent the second half of 2022 there, from June to December.",
      "My work was on Binschonda, a web app that supports elderly people with their everyday tasks. I shipped new features and fixed bugs, helping the product grow for the people who rely on it.",
    ],
    highlights: [
      {
        title: "Binschonda",
        text: "Shipped new features and bug fixes for a web app providing everyday task support for elderly users.",
      },
    ],
  },
  {
    company: "Linfa SH.P.K",
    short: "Linfa",
    role: "Front-End Developer",
    start: "April 2021",
    end: "May 2022",
    summary: [
      "Linfa SH.P.K is where my career as a developer began. After falling for code during COVID, I joined in April 2021 as a Front-End Developer and stayed for just over a year.",
      "In that time I built two products: CQS, an application that lets bank employees take out loans repaid straight from their salary, and LSS, a recruiting platform that matches open roles to what a company actually needs.",
    ],
    highlights: [
      {
        title: "CQS",
        text: "Built an application allowing bank employees to take out payroll-deducted loans.",
      },
      {
        title: "LSS",
        text: "Built a recruiting platform matching open roles to company needs.",
      },
    ],
  },
];
