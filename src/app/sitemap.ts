import type { MetadataRoute } from "next";
import { sitePages } from "@/data/pages";
import { siteUrl } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, priority: 1 },
    ...sitePages.map((page) => ({ url: `${siteUrl}${page.href}`, priority: 0.8 })),
  ];
}
