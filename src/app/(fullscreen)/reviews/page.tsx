import type { Metadata } from "next";
import { Testimonials } from "@/components/sections/Testimonials";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <Testimonials />;
}
