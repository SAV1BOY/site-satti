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
    /* W10-C: o `favicon.ico` de 25,9 KB do create-next-app foi apagado —
       `app/icon.svg` + `app/icon.png` cobrem todo browser atual e o Next emite
       os `<link>` sozinho. Aqui ficam os dois PNG que o Android instala: o de
       192 como `any` (default) e o de 512 como `maskable`, que a arte suporta
       sem re-corte porque o tile tem 21,7 % de padding nos quatro lados —
       acima dos 20 % que a safe zone maskable exige. */
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
