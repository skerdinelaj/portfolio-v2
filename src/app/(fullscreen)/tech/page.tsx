import type { Metadata } from "next";
import { TechStack } from "@/components/sections/tech/TechStack";

export const metadata: Metadata = { title: "Tech Stack" };

export default function Page() {
  return <TechStack />;
}
