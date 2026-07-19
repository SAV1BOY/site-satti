import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/** Robots (§6-W7): tudo liberado + sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
