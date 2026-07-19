/**
 * Modo de publicação (ULTRAGOAL §6-W6) — NEXT_PUBLIC_CONTENT_MODE.
 *
 * - "draft" (default, previews): [CONFIRMAR] visíveis em steel com
 *   data-confirm — é o modo de revisão do Miguel.
 * - "final" (produção com domínio): elemento sem copy oficial é OMITIDO
 *   com elegância — badge do hero some, stats S5 só com valores
 *   confirmados, métricas S9 idem, S10 não renderiza sem depoimento
 *   real, sociais mostram só GitHub, S8 esconde o chrome de rascunho.
 *   Nada de "[CONFIRMAR]" público.
 *
 * NEXT_PUBLIC_* é inlinado no build — utilizável em server E client.
 */

export type ContentMode = "draft" | "final";

export const CONTENT_MODE: ContentMode =
  process.env.NEXT_PUBLIC_CONTENT_MODE === "final" ? "final" : "draft";

/** true quando campos [CONFIRMAR] devem ser OMITIDOS (modo final). */
export const OMIT_UNCONFIRMED = CONTENT_MODE === "final";
