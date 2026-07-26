import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const CONTENT_MODE = process.env.NEXT_PUBLIC_CONTENT_MODE ?? "draft";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const IS_FINAL = CONTENT_MODE === "final";

/* --------------------------------------------------------------------------
   Guarda de domínio (ULTRAGOAL v2 · V2-D2)

   O modo `draft` serve assets do site que serve de modelo estrutural, marcados
   para swap. Isso é aceitável num preview privado e inaceitável no domínio
   público. Não confiamos numa env estar setada na hora do cutover: se alguém
   buildar apontando para o domínio próprio SEM o modo final, o build morre.
   É a falha que todo mundo teme, transformada em erro de build.
   -------------------------------------------------------------------------- */
if (SITE_URL.includes("sattiai.com") && !IS_FINAL) {
  throw new Error(
    `[SATTI] Build bloqueado: NEXT_PUBLIC_SITE_URL aponta para o domínio ` +
      `próprio (${SITE_URL}) mas NEXT_PUBLIC_CONTENT_MODE="${CONTENT_MODE}". ` +
      `O modo draft serve assets de terceiro marcados — nunca no domínio ` +
      `público. Setar NEXT_PUBLIC_CONTENT_MODE=final (V2-D2 / DEC-017).`,
  );
}

/** Headers de segurança (ULTRAGOAL §6-W7 + endurecimento do v2). */
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    /* O v1 declarava só `frame-ancestors 'none'`, que governa quem pode nos
       enquadrar e NÃO diz nada sobre o que nós podemos carregar — ou seja, um
       embed ou uma mídia de origem terceira passaria silenciosamente. Como o
       v2 não precisa de nenhum frame nem de nenhuma mídia remota (o showreel é
       self-hosted, §6 do plano de mídia), este é o momento de fechar:

         frame-src 'none'   → nenhum iframe de terceiro, nunca
         media-src 'self'   → <video>/<audio> só do nosso domínio
         img-src            → +data:/blob: para os SVG inline e o next/image

       Com isso a política de terceiros deixa de ser convenção e passa a ser
       controle imposto pelo navegador: mesmo que todo script de auditoria
       seja pulado, um asset de terceiro não carrega em produção.
       `script-src`/`default-src` ficam FORA de propósito — o @vercel/analytics
       precisa de allowance própria e isso é outra tarefa (não misturar). */
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "media-src 'self'",
      "img-src 'self' data: blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    /* O Lighthouse mediu 626 ms de render-blocking em duas folhas de CSS
       (15,3 KB + 6,3 KB) e um LCP com a maior parte em RENDER DELAY — a imagem
       já estava disponível e o browser não podia pintar. Inlinar o CSS remove
       as duas requisições do caminho crítico.
       Custo: o CSS entra no HTML de cada rota (o documento vai de ~20 KB de fio
       para ~26 KB gzip), o que é barato comparado a duas idas ao servidor antes
       do primeiro paint. */
    inlineCss: true,
  },
  images: {
    /* AVIF primeiro (25-30% abaixo do WebP; o browser negocia por Accept). */
    formats: ["image/avif", "image/webp"],
    /* O default do Next 16 é [75] só — 70 destrava o poster do hero e a mão. */
    qualities: [70, 75],
    /* 2048/3840 removidos: nenhuma fonte passa de 1920. */
    deviceSizes: [640, 750, 828, 1080, 1280, 1600, 1920],
    /* +160/192/320 para os slots de 84/150/307 px (stat-cards e mosaico).
       Todo valor precisa ficar abaixo do menor deviceSizes (640). */
    imageSizes: [32, 48, 64, 96, 128, 160, 192, 256, 320, 384, 512],
    minimumCacheTTL: 31536000,
    localPatterns: [{ pathname: "/img/**" }, { pathname: "/media/**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
