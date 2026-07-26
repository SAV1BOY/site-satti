import type { CSSProperties, ReactNode } from "react";
import styles from "./Marquee.module.css";

/**
 * Marquee — trilho de rolagem contínua, **Server Component** (zero JS no cliente).
 *
 * ── Por que CSS e não JS ────────────────────────────────────────────────────
 * O modelo faz cada marquee num tween GSAP e liga/desliga por `inView`. Aqui a
 * volta é um keyframe e a pausa off-screen é `content-visibility: auto` — o UA
 * pula render E tick de animação de subárvore fora da tela, o que compra a mesma
 * economia sem hidratação, sem observer e sem entrar no orçamento de 2 loops rAF
 * persistentes do projeto (ver ScrollProvider).
 *
 * ── Dois keyframes, não quatro ──────────────────────────────────────────────
 * `satti-marquee-x` e `satti-marquee-y`. `right`/`down` são o MESMO keyframe com
 * `animation-direction: reverse`. O modelo declara 4 keyframes de marquee que não
 * estão no DOM (código morto) e os verticais dele mudam `flex-direction` mas
 * continuam animando `x` — bug não portado: aqui o eixo `y` anima `translateY`.
 *
 * ── LEI DE DUPLICAÇÃO (invariante deste componente) ─────────────────────────
 * O loop exige o conteúdo duplicado, e duplicata em DOM é duplicata em leitor de
 * tela. Portanto:
 *
 *   • exatamente UMA lane (lane 0) / UM set (set 0) carrega o texto acessível;
 *   • toda outra lane e toda cópia extra de `repeat` leva `aria-hidden="true"`;
 *   • se `decorative`, a RAIZ é `aria-hidden` e NENHUMA lane carrega texto.
 *
 * **Nunca** passe `decorative` num marquee cujo texto é conteúdo (a faixa de
 * posicionamento, por exemplo): isso apagaria a copy da árvore de acessibilidade.
 *
 * ── Geometria do loop (por que -50% fecha sem salto) ────────────────────────
 * `.track` não tem `gap`; cada `.lane` leva `padding-right` (ou `padding-bottom`
 * no eixo y) igual ao gap. Com 2 lanes idênticas, `-50%` do trilho é exatamente
 * uma lane — o espaçamento na costura é o mesmo de dentro da lane.
 *
 * ── Ganchos de CSS para o consumidor ───────────────────────────────────────
 * `--marquee-h` — altura intrínseca usada por `contain-intrinsic-size` enquanto
 *   a lane nunca foi renderizada (só importa com `pauseOffscreen`). Defina-a na
 *   seção quando a altura do trilho é conhecida, para o `scrollHeight` do
 *   documento não oscilar antes do primeiro paint.
 * `--marquee-duration` — sobrescreve `speed` por token (ex.: `var(--dur-band)`).
 *
 * L5 (reduced-motion): a animação só é declarada dentro de
 * `@media (prefers-reduced-motion: no-preference)`. O estado estático — trilho
 * parado em `translate(0)`, lane 0 visível — é o estado reduced-motion.
 * L10: só `transform` anima.
 */

export type MarqueeDirection = "left" | "right" | "up" | "down";

/** Eixo do keyframe por direção. */
const AXIS: Record<MarqueeDirection, "x" | "y"> = {
  left: "x",
  right: "x",
  up: "y",
  down: "y",
};

/** `right`/`down` = mesmo keyframe, `animation-direction: reverse`. */
const REVERSED: Record<MarqueeDirection, boolean> = {
  left: false,
  right: true,
  up: false,
  down: true,
};

type MarqueeVars = CSSProperties & {
  "--marquee-duration"?: string;
  "--marquee-gap"?: string;
};

interface MarqueeProps {
  children: ReactNode;
  /** Duração de uma volta, em segundos. Default: 20 (no CSS, não aqui). */
  speed?: number;
  /** Sentido do deslocamento. Default: "left". */
  direction?: MarqueeDirection;
  /** Cópias do conteúdo DENTRO de cada lane. Default: 1. Use > 1 quando o
   *  conteúdo é mais estreito que a viewport (senão aparece um vão no loop). */
  repeat?: number;
  /** Espaço entre itens e na costura. Default: var(--sp-lg). Aceita `em`, que
   *  resolve contra a font-size herdada — é assim que a faixa usa 0.28em. */
  gap?: string;
  /** `content-visibility: auto` para o UA pular o tick fora da tela. Default:
   *  true. Passe false quando o trilho tem de estar em meio-curso ao aparecer. */
  pauseOffscreen?: boolean;
  /** Conteúdo puramente visual: a raiz vira aria-hidden. Default: false. */
  decorative?: boolean;
  /** Abaixo desta largura (px) o trilho vira grade estática de 2 colunas —
   *  marquee em tela pequena é ilegível. Sem JS: um `<style>` escopado por
   *  `data-marquee-static` que só troca custom properties. */
  staticBelow?: number;
  /** Classe extra na raiz (altura/bordas/cores ficam por conta da seção). */
  className?: string;
}

export default function Marquee({
  children,
  speed,
  direction = "left",
  repeat = 1,
  gap,
  pauseOffscreen = true,
  decorative = false,
  staticBelow,
  className,
}: MarqueeProps) {
  const style: MarqueeVars = {};
  if (speed !== undefined) style["--marquee-duration"] = `${speed}s`;
  if (gap !== undefined) style["--marquee-gap"] = gap;

  const sets = Math.max(1, Math.trunc(repeat));
  const axis = AXIS[direction];

  // A lane 0 é a única acessível; a clone existe só para fechar o loop.
  const lane = (clone: boolean) => (
    <div
      key={clone ? "clone" : "lane"}
      className={clone ? `${styles.lane} ${styles.clone}` : styles.lane}
      aria-hidden={clone ? "true" : undefined}
    >
      {Array.from({ length: sets }, (_, i) => (
        <div
          key={i}
          className={i === 0 ? styles.set : `${styles.set} ${styles.setExtra}`}
          // Na lane clone o aria-hidden da lane já cobre a subárvore.
          aria-hidden={!clone && i > 0 ? "true" : undefined}
        >
          {children}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={className ? `${styles.marquee} ${className}` : styles.marquee}
      style={style}
      data-axis={axis}
      data-reverse={REVERSED[direction] ? "true" : undefined}
      data-pause={pauseOffscreen ? undefined : "off"}
      data-marquee-static={staticBelow !== undefined ? staticBelow : undefined}
      aria-hidden={decorative ? "true" : undefined}
    >
      {staticBelow !== undefined ? (
        // Não dá para pôr um valor de prop na CONDIÇÃO de uma @media do módulo,
        // então o breakpoint entra aqui e só escreve custom properties — as
        // regras continuam no CSS Module (nada de classe hasheada em texto).
        <style>{staticGridCss(staticBelow)}</style>
      ) : null}
      <div className={styles.track}>
        {lane(false)}
        {lane(true)}
      </div>
    </div>
  );
}

/** Grade estática abaixo de `bp`px: sem animação, 2 colunas, uma cópia só. */
function staticGridCss(bp: number): string {
  return (
    `@media (max-width:${bp - 0.02}px){` +
    `[data-marquee-static="${bp}"]{` +
    `--marquee-play:paused;` +
    `--marquee-wrap:wrap;` +
    `--marquee-track-w:100%;` +
    `--marquee-lane-w:100%;` +
    `--marquee-lane-pad:0px;` +
    `--marquee-clone:none;` +
    `--marquee-set:none;` +
    `--marquee-item-basis:50%;` +
    `--marquee-item-grow:1;` +
    `}}`
  );
}
