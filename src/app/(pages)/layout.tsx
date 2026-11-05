import { Footer } from "@/components/sections/Footer";
import { PageBar } from "@/components/ui/PageBar";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { pageLinks } from "@/data/pages";

/** Shared shell for every page except home: scroll progress bar, page bar (title + Esc to home) and Footer. The header comes from the root layout. */
export default function PagesLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ScrollProgress />
      <PageBar pages={pageLinks} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
