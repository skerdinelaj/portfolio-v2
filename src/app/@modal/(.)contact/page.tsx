import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactLinks } from "@/components/sections/contact/ContactLinks";
import { ContactModal } from "@/components/sections/contact/ContactModal";
import { profile } from "@/data/profile";

/**
 * Intercepting route: a client-side <Link href="/contact"> renders this popup over the current page instead of
 * navigating away (the URL still becomes /contact). A full load of /contact renders (fullscreen)/contact/page.tsx.
 * `(.)` = same segment level; `@modal` is a slot, not a segment, so `contact` counts as the root level.
 * Both windows' contents are rendered here on the server and passed into the client popup (`children` and `links`).
 */
export default function ContactPopup() {
  return (
    <ContactModal links={<ContactLinks />}>
      <ContactForm to={profile.email} />
    </ContactModal>
  );
}
