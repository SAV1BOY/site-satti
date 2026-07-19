import type { CSSProperties } from "react";
import styles from "./PulseCircle.module.css";

/**
 * PulseCircle — diagrama circular do método SATTI (S5 Sobre).
 *
 * SVG quadrado responsivo (viewBox 560×560) com 3 anéis concêntricos
 * nos raios 100% / 68% / 42% (200/136/84 na comp), 10 nodes distribuídos
 * 5+3+2 com offset angular de 24° por anel, linhas de conexão radiais e
 * labels mono uppercase.
 *
 * Server Component (sem "use client"): geometria calculada em módulo,
 * animação 100% CSS.
 *
 * Leis:
 * - L3: circuit apenas nas linhas/hub do diagrama (uso funcional permitido).
 * - L5: pulso declarado somente dentro de
 *   @media (prefers-reduced-motion: no-preference); fallback estático =
 *   diagrama 100% desenhado, nodes opacos, sem animação.
 * - L10: pulso anima apenas opacity/transform (scale), 2s alternate,
 *   delay 0.15s × índice via custom property.
 *
 * Referência visual: S5 Sobre Desktop 1920.dc.html (função _diagram).
 */

const VIEWBOX = 560;
const CENTER = 280;

/** Raios dos anéis: 100% / 68% / 42% do raio externo (200px na comp). */
const RINGS = [200, 136, 84] as const;

/** Distância radial extra do label em relação ao node (comp: r + 22). */
const LABEL_OFFSET = 22;

/** Raio do node e do hub central (comp: 5 e 4). */
const NODE_RADIUS = 5;
const HUB_RADIUS = 4;

/** Distribuição dos 10 nodes pelos anéis (comp: 5 externo, 3 médio, 2 interno). */
const LAYOUT: ReadonlyArray<{ ring: 0 | 1 | 2; count: number }> = [
  { ring: 0, count: 5 },
  { ring: 1, count: 3 },
  { ring: 2, count: 2 },
];

interface DiagramNode {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "middle" | "end";
}

const round = (n: number): number => Math.round(n * 100) / 100;

function buildNodes(): ReadonlyArray<DiagramNode> {
  const nodes: DiagramNode[] = [];

  for (const group of LAYOUT) {
    const radius = RINGS[group.ring];

    for (let k = 0; k < group.count; k++) {
      // Mesma fórmula da comp: -90° inicial + passo uniforme + 24° × anel.
      const degrees = -90 + (360 / group.count) * k + group.ring * 24;
      const angle = (degrees * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";

      nodes.push({
        x: round(CENTER + radius * cos),
        y: round(CENTER + radius * sin),
        labelX: round(CENTER + (radius + LABEL_OFFSET) * cos),
        labelY: round(CENTER + (radius + LABEL_OFFSET) * sin + 4),
        anchor,
      });
    }
  }

  return nodes;
}

const NODES = buildNodes();

type NodeStyle = CSSProperties & {
  "--pulse-delay": string;
};

interface PulseCircleProps {
  /** Classe extra no svg (dimensão/posição ficam por conta da seção). */
  className?: string;
  /** Rótulo acessível — OBRIGATÓRIO e vindo do JSON (copy-law L1:
      nenhum literal editorial default no componente). */
  ariaLabel: string;
  /** Labels dos 10 nodes na ordem da comp — OBRIGATÓRIO e vindo do JSON
      (about.methodNodes), garantindo o espelho /en 1:1 (D5/§7.12). */
  labels: ReadonlyArray<string>;
}

export default function PulseCircle({
  className,
  ariaLabel,
  labels,
}: PulseCircleProps) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role="img"
      aria-label={ariaLabel}
      className={className ? `${styles.diagram} ${className}` : styles.diagram}
    >
      {RINGS.map((radius) => (
        <circle
          key={`ring-${radius}`}
          cx={CENTER}
          cy={CENTER}
          r={radius}
          className={styles.ring}
        />
      ))}

      {NODES.map((node, index) => (
        <line
          key={`spoke-${index}`}
          x1={CENTER}
          y1={CENTER}
          x2={node.x}
          y2={node.y}
          className={styles.spoke}
        />
      ))}

      <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS} className={styles.hub} />

      {NODES.map((node, index) => {
        const style: NodeStyle = { "--pulse-delay": `${round(index * 0.15)}s` };
        return (
          <circle
            key={`node-${index}`}
            cx={node.x}
            cy={node.y}
            r={NODE_RADIUS}
            className={styles.node}
            style={style}
          />
        );
      })}

      {NODES.map((node, index) => (
        <text
          key={`label-${index}`}
          x={node.labelX}
          y={node.labelY}
          textAnchor={node.anchor}
          className={styles.label}
        >
          {labels[index] ?? ""}
        </text>
      ))}
    </svg>
  );
}
