import type { Metadata } from "next";
import { HomeHub } from "@/components/sections/home/HomeHub";
import { profile } from "@/data/profile";
import { siteUrl } from "@/data/site";

// Per page, not in the root layout: every page inherits the layout's metadata, so a canonical there would tell Google
// that /about, /projects... are all copies of the home page.
export const metadata: Metadata = { alternates: { canonical: "/" } };

// Structured data (schema.org Person): tells search engines this site belongs to this person and links the same
// person's profiles elsewhere (`sameAs`), which helps a search for the name find the site.
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl,
  image: `${siteUrl}${profile.photo}`,
  jobTitle: profile.roles[0],
  description: profile.tagline,
  email: `mailto:${profile.email}`,
  sameAs: [profile.linkedin, profile.github],
};

// The site itself: Google takes the name it shows above a result from this (instead of the domain, "Vercel")
const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: profile.name,
  alternateName: [`${profile.name} Portfolio`, new URL(siteUrl).host],
  url: `${siteUrl}/`,
};

export default function Home() {
  return (
    <>
      {/* `<` escaped so the JSON can never close the script tag early */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website).replace(/</g, "\\u003c") }} />
      <HomeHub />
    </>
  );
}
