import { profile } from "@/data/profile";

export async function Footer() {
  "use cache"; // year is computed at build time, page stays static
  return (
    <footer className="mt-auto border-t border-border py-8 text-center text-sm text-muted">
      © {new Date().getFullYear()} {profile.name}
    </footer>
  );
}
