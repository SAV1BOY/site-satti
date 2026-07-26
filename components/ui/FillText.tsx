"use client";

import { type ElementType, type JSX } from "react";
import styles from "./FillText.module.css";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";

/**
 * FillText — assinatura da S5 Sobre: statement em duas camadas
 * sobrepostas. A base fica "apagada" em var(--c-line); a camada de
 * preenchimento (var(--c-iron)) é revelada por
 * `clip-path: inset(0 X% 0 0)` conforme o progresso do elemento pela
 * viewport: começa a preencher quando o topo do elemento cruza ~85%
 * da altura da viewport e completa em ~40%.
 *
 * MECANISMO: o clip-path scrub NÃO muda (DEC-021 §4 revoga o
 * DEC-019(3)). O reveal span-por-span do modelo é código morto — o
 * efeito que eles realmente renderizam é um `::after` estático sobre um
 * parágrafo a 38 % de opacidade. O scrub daqui é uma melhoria real.
 * O que mudou na W11-F é só o MOTOR: o rAF próprio saiu, entrou um
 * track do loop compartilhado (useScrollTimeline). Mesma matemática,
 * mesmos limites, mesmo arredondamento — refatoração, não redesenho.
 *
 * L10 (exceção documentada): clip-path é o próprio mecanismo da
 * assinatura fill-text; nada de layout é escrito por frame.
 *
 * L5: o ScrollProvider não monta o loop sob
 * (prefers-reduced-motion: reduce), então nenhum clip-path é escrito —
 * vale o fallback estático do CSS Module (texto 100% preenchido), que
 * ainda tem um `!important` como defesa em profundidade.
 *
 * A11y: a camada .base carrega o texto real; a .fill duplicada é
 * aria-hidden para não ser lida duas vezes.
 */

/** Topo do elemento a 85% da viewport → progresso 0 (vazio). */
const START_VH = 0.85;
/** Topo do elemento a 40% da viewport → progresso 1 (preenchido). */
const END_VH = 0.4;

type FillTextProps = {
  /** Texto do statement (string pura — é duplicada nas duas camadas). */
  children: string;
  /** Tag do elemento raiz. Default: 'p'. */
  as?: keyof JSX.IntrinsicElements;
  /** Classe extra do chamador (layout: max-width, margens etc.). */
  className?: string;
};

export default function FillText({
  children,
  as = "p",
  className,
}: FillTextProps) {
  /* O elemento inscrito é a camada .fill, não a raiz: assim o
     ScrollProvider devolve o clip-path que escreveu quando o loop é
     desmontado (flip de reduced-motion, StrictMode) sem precisar de
     limpeza manual aqui. O rect medido é o do PAI — a .fill é
     `position: absolute; inset: 0` e herdaria qualquer erro de si mesma. */
  const attachFill = useScrollTimeline<number>({
    read: (el, { vh }) => {
      const host = el.parentElement;
      if (!host) return -1;
      const rect = host.getBoundingClientRect();
      const start = vh * START_VH;
      const end = vh * END_VH;
      const progress = Math.min(
        1,
        Math.max(0, (start - rect.top) / (start - end)),
      );
      // Passo de 0.1% — o eq do loop descarta writes iguais.
      return Math.round((1 - progress) * 1000) / 10;
    },
    write: (el, right) => {
      if (right < 0) return;
      (el as HTMLElement).style.clipPath = `inset(0 ${right}% 0 0)`;
    },
  });

  const Tag = as as ElementType;

  return (
    <Tag className={className ? `${styles.root} ${className}` : styles.root}>
      <span className={styles.base}>{children}</span>
      <span ref={attachFill} className={styles.fill} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
