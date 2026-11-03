import type { Metadata } from "next";
import { Projects } from "@/components/sections/Projects";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <Projects />;
}
