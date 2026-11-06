import type { Metadata } from "next";
import { About } from "@/components/sections/about/About";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <About />;
}
