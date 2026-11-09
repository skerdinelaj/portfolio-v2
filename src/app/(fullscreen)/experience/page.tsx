import type { Metadata } from "next";
import { Experience } from "@/components/sections/experience/Experience";

export const metadata: Metadata = { title: "Experience", alternates: { canonical: "/experience" } };

export default function Page() {
  return <Experience />;
}
