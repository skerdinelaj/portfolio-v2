import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { Companies } from "@/components/sections/Companies";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return (
    <>
      <About />
      <Companies />
    </>
  );
}
