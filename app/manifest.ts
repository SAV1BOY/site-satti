import type { MetadataRoute } from "next";

/** Web manifest (§6-W7) — identidade Blueprint (paper/graphite). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SATTI",
    short_name: "SATTI",
    start_url: "/",
    display: "browser",
    background_color: "#F7F8FA",
    theme_color: "#0F1115",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
