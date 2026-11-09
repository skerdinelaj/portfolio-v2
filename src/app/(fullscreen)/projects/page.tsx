import type { Metadata } from "next";
import { Projects } from "@/components/sections/projects/Projects";

export const metadata: Metadata = { title: "Projects", alternates: { canonical: "/projects" } };

export default function Page() {
  return <Projects />;
}
