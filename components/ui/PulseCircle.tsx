import type { CSSProperties } from "react";
import styles from "./PulseCircle.module.css";

/**
 * PulseCircle — o grafo do método SATTI (S5 Sobre).
 *
 * v2 · REESCRITO contra `design/awsmd-ref/awsmd-geometry.json → about.graph`
 * (DEC-021 §7). O que existia aqui eram 3 anéis CONCÊNTRICOS com 10 nós
 * pulsando em paralelo. Três erros, todos corrigidos:
 *
 * 1. São QUATRO anéis (100 / 85,4 / 68,14 / 42 %) e o de 100 % é `disabled`
 *    — não carrega nó nem rótulo nem trigger.
 * 2. Eles NÃO são concêntricos. Cada anel é deslocado ao longo da diagonal
 *    de 45° pela diferença de raios, de modo a ficar TANGENTE INTERNAMENTE
 *    ao anel externo num ÚNICO ponto (KISS). Círculos que se beijam, não
 *    alvo de tiro — é a assinatura visual da seção.
 * 3. O `pulse` antigo rodava em 10 nós com `--pulse-delay`: dez animações
 *    infinitas concorrentes sem respaldo na referência. Sobrou UMA, no
 *    ponto principal (o `about-circle_pulse` do modelo é keyframe morto).
 *
 * Coreografia (toda em `PulseCircle.module.css`, toda em no-preference):
 * - fan-out: ao ativar o anel `i`, os nós DELE varrem do ponto de tangência
 *   até o próprio ângulo em 500 ms easeOutSine. Cada nó já nasce no ângulo
 *   FINAL no SVG e o que anima é UM `transform: translate()` (as coordenadas
 *   de volta ao KISS vivem em `--fx`/`--fy`). O modelo escreve percentuais de
 *   `top`/`right` por frame — 4–5 invalidações de layout por frame por anel,
 *   proibido pela L10 e desnecessário.
 * - halo do ponto principal: o modelo anima `box-shadow` spread 0→20px, que é
 *   propriedade de PAINT. Aqui é um disco irmão animando `transform: scale()`
 *   + `opacity`, com RESET DURO em 70 %/70,1 % (é o corte que dá onda única
 *   em vez de respiro).
 * - hover/foco no anel `i`: ele ganha borda e os anéis SEGUINTES esmaecem
 *   (.6, e o 4º a .3) em 0,4 s.
 *
 * A11Y — o pior defeito do modelo, deliberadamente NÃO repetido. Lá os
 * rótulos vivem em `content: attr(data-label)` num pseudo-elemento
 * `visibility: hidden` e as interações são `onMouseEnter` em `<div>`: teclado
 * e leitor de tela não alcançam NENHUM rótulo nem nenhum statement. Aqui o
 * SVG é `role="img"` com `aria-label` e os `<text>` ficam num
 * `<g aria-hidden="true">`; a informação real vive na `<ul>` de passos do
 * `MethodGraph`, cujos `<button>` compartilham o MESMO handler que o hover
 * dos anéis — mouse e teclado não podem divergir por construção.
 *
 * Sem "use client" (L11): não há estado nem efeito aqui. O componente entra
 * no grafo do cliente porque quem o renderiza é o `MethodGraph`, que é client.
 */

/* --- Geometria (spec: caixa quadrada, max-width 625px) ------------------- */

const VIEWBOX = 625;
const CENTER = VIEWBOX / 2;
/** Raio externo com 7,5px de folga na caixa: cabe o stroke, o ponto e o rótulo. */
const R_OUTER = 305;
/** spec: about.graph.rings.sizesPercent */
const RING_PERCENTS = [100, 85.4, 68.14, 42] as const;
const DIAG = Math.SQRT1_2;

/** spec: points.size 4 (raio 2) e points.mainSize 12 (raio 6). */
const NODE_R = 2;
const MAIN_R = 6;
/** spec: points.mainHalo "0 0 0 12px" → anel estático 12px além do ponto. */
const MAIN_HALO_R = MAIN_R + 12;
/** spec: label.offsetLeft 14. O rótulo sempre entra PARA DENTRO do anel. */
const LABEL_DX = 14;
/** Meia altura de caixa-alta: alinha o rótulo opticamente ao centro do ponto. */
const LABEL_DY = 5;

const round = (n: number): number => Math.round(n * 100) / 100;

interface Ring {
  r: number;
  cx: number;
  cy: number;
}

/**
 * Tangência interna: o centro do anel `i` fica a (R − rᵢ) do centro da caixa,
 * na direção de 45°. Assim TODOS os anéis tocam o externo no mesmo ponto.
 */
const RINGS: readonly Ring[] = RING_PERCENTS.map((percent) => {
  const r = (R_OUTER * percent) / 100;
  const offset = (R_OUTER - r) * DIAG;
  return { r: round(r), cx: round(CENTER + offset), cy: round(CENTER + offset) };
});

/** O ponto onde os quatro anéis se beijam — origem do fan-out. */
const KISS = {
  x: round(CENTER + R_OUTER * DIAG),
  y: round(CENTER + R_OUTER * DIAG),
} as const;

/**
 * Arcos de distribuição dos nós, em graus SVG (0° = direita, 90° = BAIXO,
 * 270° = topo). Duas restrições fixam estes números:
 * (a) o quadrante inferior-direito (0…90°) é do ponto de tangência — nó ali
 *     nasceria em cima do próprio ponto principal;
 * (b) o rótulo corre PARA A DIREITA a partir do nó, então o arco para antes
 *     de 270° para o texto caber dentro da caixa (a folga mínima resultante é
 *     ~137px para um rótulo de ~110px — o mais longo de about.methodNodes).
 * O anel de 100 % não aparece aqui: é o `disabled` da spec.
 */
const ARCS = [
  { ring: 1, count: 4, from: 126, to: 264 },
  { ring: 2, count: 3, from: 140, to: 258 },
  { ring: 3, count: 3, from: 155, to: 265 },
] as const;

interface GraphNode {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  /** Deslocamento que devolve o nó ao ponto de tangência (estado recolhido). */
  backX: number;
  backY: number;
}

function buildArc(arc: (typeof ARCS)[number]): readonly GraphNode[] {
  const ring = RINGS[arc.ring];
  if (!ring) return [];
  const step = arc.count > 1 ? (arc.to - arc.from) / (arc.count - 1) : 0;

  return Array.from({ length: arc.count }, (_, k) => {
    const radians = ((arc.from + step * k) * Math.PI) / 180;
    const x = ring.cx + ring.r * Math.cos(radians);
    const y = ring.cy + ring.r * Math.sin(radians);
    return {
      x: round(x),
      y: round(y),
      labelX: round(x + LABEL_DX),
      labelY: round(y + LABEL_DY),
      backX: round(KISS.x - x),
      backY: round(KISS.y - y),
    };
  });
}

/** Um grupo de nós por anel rotulado, na ordem dos anéis (85,4 → 68,14 → 42 %). */
const NODE_ARCS: ReadonlyArray<readonly GraphNode[]> = ARCS.map(buildArc);

/** Quantos rótulos cada anel carrega — o consumidor fatia a copy por aqui. */
export const RING_NODE_COUNTS: readonly number[] = ARCS.map((a) => a.count);

type NodeStyle = CSSProperties & {
  "--fx": string;
  "--fy": string;
};

interface PulseCircleProps {
  /** Classe extra no svg (dimensão/posição são da seção). */
  className?: string;
  /**
   * Rótulo acessível do grafo — OBRIGATÓRIO e vindo do JSON (L1: nenhum
   * literal editorial no componente).
   */
  ariaLabel: string;
  /**
   * Rótulos agrupados por anel rotulado, na ordem de `RING_NODE_COUNTS`.
   * Vêm de `about.methodNodes` (10 oficiais) fatiados pelo consumidor.
   */
  groups: ReadonlyArray<ReadonlyArray<string>>;
  /** Índice do GRUPO ativo (0…2). Nunca nulo: o grafo sempre mostra um anel. */
  activeGroup: number;
  /**
   * Trigger SECUNDÁRIO (ponteiro sobre o anel). O primário é a `<ul>` de
   * passos do MethodGraph — os dois chamam este mesmo handler.
   */
  onActivate?: (group: number) => void;
}

export default function PulseCircle({
  className,
  ariaLabel,
  groups,
  activeGroup,
  onActivate,
}: PulseCircleProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role="img"
      aria-label={ariaLabel}
      /* Índice do ANEL (1…4), não do grupo: deixa o CSS de esmaecimento dos
         anéis seguintes literal e legível. */
      data-active-ring={activeGroup + 2}
      className={className ? `${styles.diagram} ${className}` : styles.diagram}
    >
      {RINGS.map((ring, index) => (
        <g
          key={`ring-${index}`}
          className={styles.ringGroup}
          data-ring={index + 1}
        >
          <circle
            className={styles.ring}
            cx={ring.cx}
            cy={ring.cy}
            r={ring.r}
          />
          {/* A "borda" que o anel ganha ao ficar ativo: um irmão em opacity 0,
              porque L10 não quer transição de stroke escrita por frame. */}
          <circle
            className={styles.ringEdge}
            cx={ring.cx}
            cy={ring.cy}
            r={ring.r}
          />
          {index > 0 ? (
            <circle
              className={styles.ringHit}
              cx={ring.cx}
              cy={ring.cy}
              r={ring.r}
              onMouseEnter={
                onActivate ? () => onActivate(index - 1) : undefined
              }
              onPointerDown={
                onActivate ? () => onActivate(index - 1) : undefined
              }
            />
          ) : null}
        </g>
      ))}

      {/* Ponto principal no ponto de tangência: halo estático + onda única. */}
      <circle
        className={styles.mainHalo}
        cx={KISS.x}
        cy={KISS.y}
        r={MAIN_HALO_R}
      />
      <circle className={styles.wave} cx={KISS.x} cy={KISS.y} r={MAIN_R} />
      <circle className={styles.mainDot} cx={KISS.x} cy={KISS.y} r={MAIN_R} />

      {/* Rótulos: decorativos por decisão de a11y — a informação real está na
          <ul> do MethodGraph, que é quem teclado e leitor de tela alcançam. */}
      <g aria-hidden="true">
        {NODE_ARCS.map((nodes, group) =>
          nodes.map((node, k) => {
            const style: NodeStyle = {
              "--fx": `${node.backX}px`,
              "--fy": `${node.backY}px`,
            };
            return (
              <g
                key={`node-${group}-${k}`}
                className={styles.node}
                data-on={group === activeGroup ? "true" : undefined}
                style={style}
              >
                <circle
                  className={styles.dot}
                  cx={node.x}
                  cy={node.y}
                  r={NODE_R}
                />
                <text
                  className={styles.label}
                  x={node.labelX}
                  y={node.labelY}
                >
                  {groups[group]?.[k] ?? ""}
                </text>
              </g>
            );
          }),
        )}
      </g>
    </svg>
  );
}
