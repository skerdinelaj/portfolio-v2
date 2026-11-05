import { PageBar } from "@/components/ui/PageBar";
import { pageLinks } from "@/data/pages";

/**
 * Shell for one-screen pages (/about, /experience, /tech, /contact): the page bar (title + Esc to home), no Footer and no scroll progress bar, and <main> fills the space
 * under the site header (which comes from the root layout). The group folder name doesn't appear in the URL.
 */
export default function FullscreenLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PageBar pages={pageLinks} />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
