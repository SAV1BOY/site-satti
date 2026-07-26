/**
 * Governança de assets de terceiro (ULTRAGOAL v2 · V2-D2 / DEC-016 / DEC-017).
 *
 * O v2 usa os assets do site que serve de modelo estrutural para que a paridade
 * visual possa ser avaliada em PREVIEW. Nada disso pode chegar ao domínio
 * público. Este módulo é o único ponto de decisão:
 *
 *   - em `draft`  → o asset de terceiro renderiza, marcado com data-third-party
 *   - em `final`  → conforme a declaração de lib/third-party-assets.json:
 *                   "omit" (não renderiza), "placeholder" (blueprint) ou
 *                   "deferred" (mostra o poster e não monta o vídeo)
 *
 * `scripts/check-thirdparty.mjs` roda a mesma declaração no CI e falha o build
 * se algum asset marcado puder ser servido em `final`.
 *
 * Regra de ouro: NENHUM componente decide isso sozinho. Todo slot que consome
 * um asset da declaração passa por `resolveAsset()`.
 */

import declaration from "./third-party-assets.json";
import { OMIT_UNCONFIRMED } from "./content-mode";

export type FinalMode = "omit" | "placeholder" | "deferred";
export type AssetKind = "image" | "video";

export interface ThirdPartyAsset {
  id: string;
  /** Path único, quando o asset é um arquivo só. */
  path?: string;
  /** Glob, quando o asset é um conjunto (mosaico, shots, texturas…). */
  pathGlob?: string;
  count?: number;
  kind: AssetKind;
  section: string;
  finalMode: FinalMode;
  /** Path do poster/placeholder usado em `final`, ou "blueprint". */
  placeholder?: string;
  swapTarget: string;
}

const ASSETS: readonly ThirdPartyAsset[] =
  declaration.assets as readonly ThirdPartyAsset[];

const BY_ID = new Map(ASSETS.map((a) => [a.id, a]));

export function getThirdPartyAsset(id: string): ThirdPartyAsset | undefined {
  return BY_ID.get(id);
}

export function isThirdParty(id: string): boolean {
  return BY_ID.has(id);
}

/** Todos os ids declarados — usado pelo check e pelo relatório de swap. */
export function thirdPartyIds(): string[] {
  return [...BY_ID.keys()];
}

export interface ResolvedAsset {
  /** Renderizar o asset? Em `final` com finalMode "omit" → false. */
  render: boolean;
  /** src efetivo. Em `final` pode ser o placeholder em vez do original. */
  src: string;
  /** Montar o <video>? `deferred` em final mostra só o poster. */
  mountVideo: boolean;
  /** Valor de data-third-party — presente só quando o asset é de terceiro. */
  marker?: string;
}

/**
 * Decide o que renderizar para um slot.
 *
 * @param id  id declarado em third-party-assets.json (ou qualquer string, se o
 *            asset não for de terceiro — nesse caso passa direto).
 * @param src path público do asset (ex.: "/media/hero.mp4").
 * @param blueprintSrc placeholder blueprint a usar quando finalMode ===
 *            "placeholder". Obrigatório para assets de imagem declarados.
 */
export function resolveAsset(
  id: string,
  src: string,
  blueprintSrc?: string,
): ResolvedAsset {
  const asset = BY_ID.get(id);

  // Asset próprio da SATTI: nada a decidir.
  if (!asset) return { render: true, src, mountVideo: true };

  // Preview: renderiza tudo, marcado.
  if (!OMIT_UNCONFIRMED) {
    return { render: true, src, mountVideo: true, marker: asset.id };
  }

  // Produção com domínio.
  switch (asset.finalMode) {
    case "omit":
      return { render: false, src, mountVideo: false };
    case "placeholder":
      return {
        render: true,
        src: blueprintSrc ?? src,
        mountVideo: false,
      };
    case "deferred":
      // O path é o definitivo. Quando o arquivo real da SATTI aparecer nele, a
      // entrada sai da declaração e este ramo deixa de ser alcançado.
      return { render: true, src, mountVideo: false };
  }
}

/** Linhas da tabela de swap do RELATORIO-FINAL-v2. */
export function swapTable(): Array<{
  id: string;
  section: string;
  path: string;
  finalMode: FinalMode;
  swapTarget: string;
}> {
  return ASSETS.map((a) => ({
    id: a.id,
    section: a.section,
    path: a.path ?? a.pathGlob ?? "",
    finalMode: a.finalMode,
    swapTarget: a.swapTarget,
  }));
}
