import type { MetadataRoute } from "next";

/** Robots (§6-W7): tudo liberado + sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://sattiai.com/sitemap.xml",
  };
}
