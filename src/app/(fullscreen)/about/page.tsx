import type { Metadata } from "next";
import { About } from "@/components/sections/about/About";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function Page() {
  return <About />;
}
