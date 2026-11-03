import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

/** Shared shell for every page except home: scroll progress bar, Navbar on top, Footer at the bottom. */
export default function PagesLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
