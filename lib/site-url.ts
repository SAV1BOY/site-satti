/**
 * Base de URL do site (DEC-013) — canonical/hreflang/OG/sitemap/robots
 * apontam SEMPRE para a origem que está servindo:
 *
 * 1. NEXT_PUBLIC_SITE_URL — setada para https://sattiai.com no cutover
 *    do domínio (único flip necessário; instrução no RELATORIO-FINAL);
 * 2. VERCEL_PROJECT_PRODUCTION_URL — domínio de produção da Vercel
 *    (site-satti.vercel.app) enquanto o domínio próprio não aponta;
 * 3. localhost — dev.
 *
 * Sem isso, o canonical apontaria para um domínio ainda não servido e o
 * Lighthouse SEO reprova ("points to another hreflang location").
 */

const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL: string =
  fromEnv && fromEnv.length > 0
    ? fromEnv
    : fromVercel && fromVercel.length > 0
      ? `https://${fromVercel}`
      : "http://localhost:3000";
