import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Guarda de host (ULTRAGOAL v2 · V2-D2, complementa a guarda de build).
 *
 * O modo `draft` serve os assets do site que serve de modelo estrutural,
 * marcados para swap. Isso é o estado pretendido no preview e inaceitável no
 * domínio da marca.
 *
 * `next.config.ts` já mata o BUILD se `NEXT_PUBLIC_SITE_URL` apontar para
 * sattiai.com sem `CONTENT_MODE=final`. Mas essa guarda olha uma env, e o risco
 * real é outro: o domínio JÁ está adicionado e aliasado na Vercel, esperando só
 * o DNS. No dia em que o DNS apontar, o mesmo deployment em draft passa a
 * responder por sattiai.com sem que nenhum build aconteça — e nenhuma env muda.
 *
 * Então a checagem que importa é por HOST, em tempo de request. Em vez de deixar
 * isso como um aviso no relatório ("lembre de trocar a env antes de apontar o
 * DNS"), aqui vira impossibilidade: o domínio da marca em draft responde 503 com
 * a instrução, nunca a página com asset de terceiro.
 *
 * Para liberar: `NEXT_PUBLIC_CONTENT_MODE=final` nas envs de produção da Vercel
 * + redeploy. É o mesmo flip que o RELATORIO-FINAL-v2 documenta.
 */
const BRAND_HOSTS = ["sattiai.com", "www.sattiai.com"];
const IS_FINAL = process.env.NEXT_PUBLIC_CONTENT_MODE === "final";

export default function proxy(request: NextRequest) {
  if (!IS_FINAL) {
    const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();
    if (host && BRAND_HOSTS.includes(host)) {
      return new NextResponse(
        "SATTI — este deployment está em modo de revisao (draft) e serve assets " +
          "marcados para troca, que nao podem aparecer no dominio publico.\n\n" +
          "Para liberar: definir NEXT_PUBLIC_CONTENT_MODE=final nas variaveis de " +
          "ambiente de producao na Vercel e fazer redeploy.\n\n" +
          "Ver RELATORIO-FINAL-v2.md, secao de cutover de dominio.\n",
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        },
      );
    }
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
