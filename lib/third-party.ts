/**
 * Governança de assets de terceiro (ULTRAGOAL v2 · V2-D2 / DEC-016 / DEC-017).
 *
 * O v2 usa os assets do site que serve de modelo estrutural para que a paridade
 * visual possa ser avaliada em PREVIEW. Nada disso pode chegar ao domínio
 * público. Este módulo é o único ponto de decisão:
 *
 *   - em `draft`  → o asset renderiza, marcado com data-third-party
 *   - em `final`  → conforme lib/third-party-assets.json:
 *                   vídeo de terceiro → "omit"        (não monta)
 *                   imagem de terceiro → "placeholder" (blueprint)
 *
 * `scripts/check-thirdparty.mjs` roda a MESMA declaração no CI e falha o build
 * se algum asset importado puder ser servido em `final`.
 *
 * Regra de ouro: nenhum componente decide isso sozinho. Todo slot que consome
 * um asset da declaração passa por `resolveAsset()`.
 *
 * A busca é POR PATH PÚBLICO, não por id. Isso importa: 4 dos grupos declarados
 * (mosaico, shots do portfólio, texturas, thumbs de case) são declarados por
 * `pathGlob`, cobrindo 23 arquivos. Uma API por id obrigaria cada componente a
 * saber a qual grupo o seu arquivo pertence — e foi exatamente essa cegueira que
 * deixou 11 slots reais sem cobertura de gate na primeira versão deste módulo.
 */

import declaration from "./third-party-assets.json";
import { OMIT_UNCONFIRMED } from "./content-mode";

export type FinalMode = "omit" | "placeholder" | "deferred";
export type AssetKind = "image" | "video";

export interface ThirdPartyAsset {
  id: string;
  path?: string;
  pathGlob?: string;
  count?: number;
  kind: AssetKind;
  section: string;
  finalMode: FinalMode;
  placeholder?: string;
  swapTarget: string;
}

const ASSETS: readonly ThirdPartyAsset[] =
  declaration.assets as readonly ThirdPartyAsset[];

/** "public/img/portfolio/shot-*.webp" → /^\/img\/portfolio\/shot-[^/]*\.webp$/ */
function globToRegExp(glob: string): RegExp {
  const publicPath = glob.replace(/^public/, "");
  const escaped = publicPath.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*/g, "[^/]*")}$`);
}

interface Matcher {
  asset: ThirdPartyAsset;
  exact?: string;
  pattern?: RegExp;
}

const MATCHERS: readonly Matcher[] = ASSETS.map((asset) =>
  asset.path
    ? { asset, exact: asset.path.replace(/^public/, "") }
    : { asset, pattern: globToRegExp(asset.pathGlob ?? "") },
);

/** Asset declarado que cobre este path público, ou undefined. */
export function findThirdParty(src: string): ThirdPartyAsset | undefined {
  for (const m of MATCHERS) {
    if (m.exact !== undefined) {
      if (m.exact === src) return m.asset;
    } else if (m.pattern?.test(src)) {
      return m.asset;
    }
  }
  return undefined;
}

export function isThirdParty(src: string): boolean {
  return findThirdParty(src) !== undefined;
}

export function thirdPartyIds(): string[] {
  return ASSETS.map((a) => a.id);
}

export interface ResolvedAsset {
  /** Renderizar? Em `final` com finalMode "omit" → false. */
  render: boolean;
  /** src efetivo. Em `final` pode ser o blueprint em vez do original. */
  src: string;
  /** Montar o <video>? Só em draft, e só para asset de vídeo. */
  mountVideo: boolean;
  /** Valor de data-third-party — presente só em draft e só se for de terceiro. */
  marker?: string;
}

/**
 * Decide o que renderizar para um slot.
 *
 * @param src          path público do asset (ex.: "/media/hero.mp4").
 * @param blueprintSrc placeholder a usar quando finalMode === "placeholder".
 *                     Se ausente, cai no `placeholder` da declaração e, em
 *                     último caso, no próprio src.
 */
export function resolveAsset(src: string, blueprintSrc?: string): ResolvedAsset {
  if (!src) return { render: false, src, mountVideo: false };

  const asset = findThirdParty(src);

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
    case "placeholder": {
      const declared = asset.placeholder;
      const fallback =
        blueprintSrc ??
        (declared && declared !== "blueprint" ? declared.replace(/^public/, "") : src);
      return { render: true, src: fallback, mountVideo: false };
    }
    case "deferred":
      // Reservado. Hoje nenhum asset usa (DEC-017b): um poster marcado como
      // deferred renderizaria o frame do modelo em produção.
      return { render: true, src, mountVideo: false };
  }
}

/** Atributos de marcação — provadamente ausentes no modo final. */
export function thirdPartyAttrs(src: string): Record<string, string> {
  if (OMIT_UNCONFIRMED) return {};
  const asset = findThirdParty(src);
  return asset ? { "data-third-party": asset.id } : {};
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
