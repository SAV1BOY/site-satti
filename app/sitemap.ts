import type { MetadataRoute } from "next";

/** Sitemap (§6-W7): home nos 2 idiomas com alternates hreflang. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://sattiai.com";
  const languages = {
    "pt-BR": base,
    en: `${base}/en`,
  };

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${base}/en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages },
    },
  ];
}
