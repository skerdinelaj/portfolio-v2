import "server-only";

/**
 * The live site's absolute URL, for metadata, the sitemap and structured data (search engines need full URLs).
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every build to the project's production domain (a custom domain once
 * one is added), so nothing here needs changing when the domain does. Locally it falls back to the dev server.
 */
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
