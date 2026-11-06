import type { Metadata } from "next";
import { Contact } from "@/components/sections/contact/Contact";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <Contact />;
}
