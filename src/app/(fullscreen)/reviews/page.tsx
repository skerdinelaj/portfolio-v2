import type { Metadata } from "next";
import { Testimonials } from "@/components/sections/reviews/Testimonials";

export const metadata: Metadata = { title: "Reviews", alternates: { canonical: "/reviews" } };

export default function Page() {
  return <Testimonials />;
}
