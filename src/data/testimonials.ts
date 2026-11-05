import type { ReferenceLetter, Testimonial } from "./types";

/**
 * Colleagues. A `quote` goes in only when they've sent their own words (with permission to publish them); until then
 * the card says the review is on its way. Reviewer photos go in /public/reviewers.
 */
export const testimonials: Testimonial[] = [
  { name: "Trejsi Tena", companies: ["Linfa", "Engage Technology"] },
  { name: "Lejdi Prifti", companies: ["Linfa", "Okko"] },
  { name: "Halit Lala", companies: ["Division 5"] },
];

/** Shown under each letter in the popup. */
export const letterNote = "Quoted from the signed letter. Contact details, addresses and signatures are left out.";

/**
 * The signed reference letters, quoted in full minus private details (phone numbers, emails, the firm's address and
 * registration number, signatures). Only put a PDF in /public/letters once those are removed from it too.
 */
export const referenceLetters: ReferenceLetter[] = [
  {
    slug: "kristi-vako",
    author: "Kristi Vako",
    role: "Managing Director",
    company: "Oracle Law Global",
    relation: "Director of the firm where I was frontend developer, 2024–2026",
    date: "30.09.2026",
    excerpt:
      "He is a capable and thoroughly reliable developer who writes careful code, communicates unusually well with non-technical colleagues, and can be trusted absolutely to deliver what he undertakes.",
    highlights: [
      "can be trusted absolutely to deliver what he undertakes",
      "communicates unusually well with non-technical colleagues",
      "Over two years I cannot recall a commitment he failed to meet.",
    ],
    body: [
      {
        paragraphs: [
          "It is a genuine pleasure to write this reference for Mr Skerdi Nelaj, who was employed by “Oracle Law Global Albania” SHPK as Frontend Developer / \u201cZhvillues Front-End\u201d from 10 June 2024 until 30 September 2026, when he left the firm at his own initiative. This reference is issued at his request. He was a very good employee throughout, and I recommend him warmly and without reservation.",
          "Mr Nelaj joined as our frontend developer and held that role for over two years, working on the internal systems and interfaces the firm depends on to run its practice.",
        ],
      },
      {
        heading: "Scope of his role",
        paragraphs: [
          "Mr Nelaj was responsible for the front end of the firm’s internal applications — the interfaces through which our lawyers, coordinators and administrative staff do their daily work. He built and maintained screens and views across those systems, implemented new functionality from specification through to deployment, integrated the front end with the back-end services and APIs behind it, and fixed defects as they arose. He worked across the full development cycle on the features assigned to him rather than at a single stage of it.",
          "His day-to-day work was in React with TypeScript, alongside modern JavaScript (ES6+), HTML5 and CSS3. He worked with component-based architecture and reusable component libraries, handled client-side state management, consumed and integrated REST APIs from our back-end services, wrote responsive CSS against design files, and used Git with pull-request-based code review throughout.",
          "The work called for the ordinary disciplines of the craft and he observed all of them: clean and readable code, sensible component structure, layouts that behave correctly across screen sizes and browsers, attention to loading behaviour and performance, and version control and code review practised properly rather than nominally. He tested his own work before submitting it, which sounds elementary and is not universal, and the volume of defects returned to him was correspondingly low.",
          "What distinguished his work in our particular setting was something a purely technical description misses. His users were lawyers and legal staff, not developers, and their time is chargeable — which means an interface that takes three clicks where it could take one is not an aesthetic problem but a commercial one. Mr Nelaj understood that. He took the time to learn how the work actually flows through this firm, sat with the people who would use what he was building, and asked the questions that surface the real requirement rather than the one first described to him. He was willing to say when a request would not work well in practice and to propose the alternative, which is considerably more useful than building exactly what was asked for.",
          "He also handled the requirements process itself with people who could not express their needs in technical terms. He translated operational problems into something buildable, explained technical constraints in plain language without condescension, and kept colleagues informed about what was possible and by when. In a firm with a small technical function and no intermediate layer of product management, that ability mattered as much as the code.",
        ],
      },
      {
        heading: "How he works",
        paragraphs: [
          "Mr Nelaj is a very good developer and was a very good employee, and I use the description deliberately rather than as a courtesy. He is careful and exact: his work was accurate, his estimates were realistic, and he delivered what he said he would deliver by the time he said he would deliver it. Where something was going to take longer than expected he said so early, while the schedule could still absorb it, rather than at the point of delivery. Over two years I cannot recall a commitment he failed to meet.",
          "He worked well independently, which was necessary here — he was largely self-directed, without a senior developer alongside him to consult — and he made sound judgements on his own about how to approach a problem. He is also genuinely receptive to feedback: where his work was reviewed and changed, he took the point and applied it afterwards. He kept learning throughout his time here, and the quality of his work at the end of over two years was visibly ahead of where it began.",
          "He is pleasant, unassuming and helpful, and he was well liked across the firm — including by colleagues who found the systems difficult and came to him for help with more patience required than the question strictly deserved. He handled the confidential client data that passes through our systems with complete propriety throughout, and he observed the firm’s data-protection obligations scrupulously, which in a legal practice is not a formality but a core professional duty.",
        ],
      },
      {
        heading: "Departure and recommendation",
        paragraphs: [
          "Mr Nelaj left this firm entirely at his own initiative, having resigned in order to pursue the next stage of his career. He left on entirely good terms and with our regret at losing him, and should the opportunity arise to work with him again we would take it.",
          "I recommend Mr Skerdi Nelaj warmly and without hesitation. He is a capable and thoroughly reliable developer who writes careful code, communicates unusually well with non-technical colleagues, and can be trusted absolutely to deliver what he undertakes. He would be an asset to any development team, and any employer considering him should know that they are considering someone this firm was sorry to lose.",
        ],
      },
    ],
  },
  {
    slug: "ersilda-pellumbi",
    author: "Ersilda Pellumbi",
    role: "Project Manager",
    company: "Oracle Law Global · Okko",
    relation: "My project manager at Oracle Law Global and again on Okko",
    date: "12.10.2026",
    excerpt: "I could hand him a feature as a product requirement and trust him to deliver all of it.",
    highlights: [
      "I could hand him a feature as a product requirement and trust him to deliver all of it.",
      "real ability in building practical AI tools",
      "I would gladly work with him again",
    ],
    body: [
      {
        paragraphs: [
          "I am glad to write this reference for Mr Skerdi Nelaj. I was his Project Manager at Oracle Law Global from June 2024 until I left the firm in February 2026, and I was his Project Manager again on Okko, a social and jobs mobile app, from November 2025 to September 2026. In both roles I was the person who defined his tasks, set priorities and deadlines, and reviewed what he delivered. I therefore know his work closely, across two quite different products, and I recommend him without reservation.",
        ],
      },
      {
        heading: "Oracle Law Global",
        paragraphs: [
          "At Oracle Law Global, Mr Nelaj worked on the internal applications the firm’s lawyers and staff use to handle their cases, most of which concern disrupted and delayed flights. I assigned him work on the front end of these systems in React and TypeScript, and increasingly on tools that brought AI into the firm’s daily practice.",
          "The most significant of these was AI Defense Builder, which uses the Claude API to generate first drafts of legal defenses for flight-related cases. In testing, it reduced the estimated drafting time per case from around two hours to 15–20 minutes. He also built Rebooking, a tool that gives lawyers access to historical flight data to support disrupted-flight claims. When I raised the problem of a data analyst spending a large part of each day distributing incoming cases by hand, he replaced that manual process with a Python script that assigns cases evenly across the team. Alongside this, he looked after the firm’s website, including its hosting, SEO and GDPR compliance.",
          "What I valued most was that he understood the purpose behind each task, not only its specification. Our users were lawyers with little time and no technical background, and he took the trouble to understand how they actually worked before deciding how to build something for them.",
        ],
      },
      {
        heading: "Okko",
        paragraphs: [
          "On Okko, Mr Nelaj was responsible for the product end to end. He built the React Native/Expo mobile app, where users chat, share project ideas, post and browse jobs, and connect with one another. He also built its Node.js/Express backend, with MongoDB, PostgreSQL and JWT authentication, in a microservices architecture on AWS. Owning both the client and the server, he made sound decisions about how the two should fit together, and I could hand him a feature as a product requirement and trust him to deliver all of it.",
        ],
      },
      {
        heading: "Working with him as his project manager",
        paragraphs: [
          "From a planning point of view, Mr Nelaj is easy to rely on. His estimates were honest, and when a task turned out to be larger than expected he told me early enough for us to adjust the plan, rather than at the deadline. He asked clarifying questions before he started work, which meant fewer surprises and less rework later. He needed little supervision, and when I gave him feedback he took it on board and applied it to the next task without being reminded.",
          "He is also a pleasant and dependable colleague. He explained technical limitations to non-technical people clearly and patiently, he was generous with his time when others needed help, and he handled confidential client data with the care a legal setting requires.",
        ],
      },
      {
        heading: "Recommendation",
        paragraphs: [
          "I recommend Mr Skerdi Nelaj warmly and with confidence. He is a capable full stack developer who delivers what he commits to, communicates well with both technical and non-technical colleagues, and has shown real ability in building practical AI tools. I would gladly work with him again, and I believe he will be an asset to any team or program he joins.",
        ],
      },
    ],
  },
];
