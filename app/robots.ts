import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";

/**
 * Robots (§6-W7 + V2-D2).
 *
 * No modo `final` (domínio público) tudo é liberado.
 *
 * No modo `draft` o site serve assets do modelo estrutural marcados para swap
 * e copy `[CONFIRMAR]` em steel — é o ambiente de revisão do Miguel, não
 * conteúdo público. Um preview indexado seria justamente o vazamento que a
 * marcação existe para evitar, então `draft` é noindex por padrão.
 */
export default function robots(): MetadataRoute.Robots {
  if (!OMIT_UNCONFIRMED) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
