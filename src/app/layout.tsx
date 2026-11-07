import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { SiteHeader } from "@/components/sections/site/SiteHeader";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { profile } from "@/data/profile";
import { googleSiteVerification, siteUrl } from "@/data/site";
import "./globals.css";

// The app's only font. Variable font: weights plus the extra SOFT (rounded corners) and opsz (optical size) axes
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const description = `${profile.name}, ${profile.roles.join(", ")}. ${profile.tagline}`;

export const metadata: Metadata = {
  // Absolute base for every URL in metadata (Open Graph links, etc.)
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name}: ${profile.roles[0]}`,
    template: `%s · ${profile.name}`,
  },
  description,
  authors: [{ name: profile.name, url: siteUrl }],
  openGraph: {
    type: "website",
    siteName: profile.name,
    title: `${profile.name}: ${profile.roles[0]}`,
    description,
  },
  verification: { google: googleSiteVerification },
};

// Runs before first paint: saved choice, else system preference. Prevents a theme flash.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

// `modal` is the @modal parallel-route slot: empty normally, the contact popup when /contact is intercepted
export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <MotionProvider>
          {/* In the root layout so it stays mounted across every navigation (home included) */}
          <SiteHeader />
          {children}
          {modal}
        </MotionProvider>
      </body>
    </html>
  );
}
