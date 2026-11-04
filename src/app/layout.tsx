import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { profile } from "@/data/profile";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// Variable font: weights plus the extra SOFT (rounded corners) and opsz (optical size) axes
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${profile.name}: Full Stack Developer`,
    template: `%s · ${profile.name}`,
  },
  description: profile.tagline,
};

// Runs before first paint: saved choice, else system preference. Prevents a theme flash.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <MotionProvider>
          {/* In the root layout so it stays mounted across every navigation (home included) */}
          <SiteHeader />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
