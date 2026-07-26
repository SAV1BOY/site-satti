/**
 * SattiMark — a marca SATTI como SVG inline (header, rodapé, menu).
 *
 * NÃO é arquivo em `public/`: o markup vive aqui. Três razões, na ordem em que
 * pesam:
 * 1. **Zero request.** Header e rodapé mostram a marca em toda página; um
 *    `public/*.svg` custaria dois GETs por navegação para ~950 B de arte.
 * 2. **Zero CLS.** A 24 px não existe negociação de intrinsic size — `width` e
 *    `height` saem prontos do próprio `size`.
 * 3. **Uma variante, não duas.** Os polígonos do S usam `currentColor`, então
 *    a MESMA marca sai iron no header claro e paper no rodapé graphite,
 *    herdando a cor do texto ao lado. O problema clássico de "logo claro +
 *    logo escuro" desaparece em vez de custar dois arquivos.
 *
 * **O corte do nó é VÃO, não traço.** No `F1_TEv17.svg` original o corte é um
 * `<line>` iron de 24,11 px que funciona porque o tile atrás é iron. Aqui não
 * há tile: um traço colorido teria que adivinhar a cor de fundo (iron no
 * header, graphite no rodapé, blaze na faixa de posicionamento). O hexágono
 * chega já recortado em DOIS polígonos separados pela banda de 24,11 px — o
 * vão é geometria, e a marca funciona sobre qualquer fundo sem nenhuma
 * variante. `scripts/make-brand-assets.mjs` calcula esse recorte
 * (Sutherland–Hodgman), PROVA em pixel que ele reproduz o traço original e
 * FALHA se os polígonos abaixo divergirem dos que ele emitiu — as duas cópias
 * da geometria não podem sair de sincronia.
 *
 * Server Component (sem "use client"): é arte estática, não tem estado.
 *
 * Fonte: `Site/BRANDING/logo-factory/out/F1_TE/F1_TEv17.svg`, viewBox recortado
 * à tinta (a marca é centrada em 512,512 no tile de 1024; 222,54 + 801,46 =
 * 1024 nos dois eixos, então o viewBox quadrado é justo e não distorce).
 */

/** viewBox justo à tinta — idêntico ao de `public/img/brand/satti-symbol.svg`. */
const VIEW_BOX = "222.54 222.54 578.92 578.92";

/** Os dois braços do S. No original são os polígonos paper. */
const ARMS = [
  "715.36,223.36 280.76,223.36 223.36,280.76 223.36,512 280.76,569.4 337.89,569.22 436.92,587.08 419.06,488.04 338.16,454.6 338.16,338.16 600.56,338.16",
  "308.64,800.64 743.24,800.64 800.64,743.24 800.64,512 743.24,454.6 686.11,454.78 587.08,436.92 604.94,535.96 685.84,569.4 685.84,685.84 423.44,685.84",
] as const;

/** Os dois ganchos + as duas metades do nó hexagonal, já com o vão do corte. */
const BLAZE = [
  "726.84,223.36 772.76,223.36 801.46,252.06 801.46,309.46 772.76,338.16 612.04,338.16",
  "297.16,800.64 251.24,800.64 222.54,771.94 222.54,714.54 251.24,685.84 411.96,685.84",
  "438.8,568.15 406.38,512 459.19,420.53 564.81,420.53 572.72,434.23",
  "617.62,512 564.81,603.47 459.19,603.47 451.28,589.77 585.2,455.85",
] as const;

interface SattiMarkProps {
  /** Lado do quadrado em px (a marca é 1:1). Default 24 = altura do header. */
  size?: number;
  /** Classe extra no `<svg>` (posição/cor ficam por conta de quem consome). */
  className?: string;
  /**
   * Rótulo acessível. **Só passe se a marca aparecer SOZINHA** — no header e no
   * rodapé ela fica ao lado do nome em texto, e nesse caso o default
   * (`aria-hidden`) é o correto: anunciar "SATTI" duas vezes é pior que não
   * anunciar. Copy vinda do JSON quando existir (L1).
   */
  ariaLabel?: string;
}

export default function SattiMark({
  size = 24,
  className,
  ariaLabel,
}: SattiMarkProps) {
  return (
    <svg
      viewBox={VIEW_BOX}
      width={size}
      height={size}
      className={className}
      shapeRendering="geometricPrecision"
      {...(ariaLabel
        ? { role: "img", "aria-label": ariaLabel }
        : { "aria-hidden": true })}
    >
      {ARMS.map((points) => (
        <polygon key={points} points={points} fill="currentColor" />
      ))}
      {BLAZE.map((points) => (
        <polygon key={points} points={points} fill="var(--c-blaze)" />
      ))}
    </svg>
  );
}
