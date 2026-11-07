import { HomeHub } from "@/components/sections/home/HomeHub";
import { profile } from "@/data/profile";
import { siteUrl } from "@/data/site";

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

export default function Home() {
  return (
    <>
      {/* `<` escaped so the JSON can never close the script tag early */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      <HomeHub />
    </>
  );
}
