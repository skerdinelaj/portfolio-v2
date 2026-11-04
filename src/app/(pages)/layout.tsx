import { Footer } from "@/components/sections/Footer";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

/** Shared shell for every page except home: scroll progress bar and Footer. The header comes from the root layout. */
export default function PagesLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ScrollProgress />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
