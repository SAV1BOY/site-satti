"use client";

import { useEffect, useRef, type ElementType, type JSX } from "react";
import styles from "./FillText.module.css";

/**
 * FillText — assinatura da S5 Sobre: statement em duas camadas
 * sobrepostas. A base fica "apagada" em var(--c-line); a camada de
 * preenchimento (var(--c-iron)) é revelada por
 * `clip-path: inset(0 X% 0 0)` conforme o progresso do elemento pela
 * viewport: começa a preencher quando o topo do elemento cruza ~85%
 * da altura da viewport e completa em ~40%.
 *
 * Mecanismo de scroll (L10): IntersectionObserver liga/desliga um
 * loop de requestAnimationFrame que lê getBoundingClientRect() no
 * frame — sem scroll listener. Só clip-path muda (nada de layout);
 * clip-path é aceitável aqui pois é o próprio mecanismo da
 * assinatura fill-text, documentado como exceção ao par
 * transform/opacity.
 *
 * L5: o loop só roda com (prefers-reduced-motion: no-preference).
 * Em reduced-motion (e sem JS) o fallback estático do CSS Module
 * mantém o texto 100% preenchido.
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
  const rootRef = useRef<HTMLElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const fill = fillRef.current;
    if (!root || !fill) return;

    // L5: anima apenas com motion ok. Em reduced-motion não escreve
    // clip-path nenhum — vale o estado estático 100% preenchido do CSS.
    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    if (!motionOk) return;

    let raf = 0;
    let lastRight = -1;

    const frame = () => {
      // Leitura no frame (L10): getBoundingClientRect + innerHeight,
      // escrita única de clip-path. Passo de 0.1% evita writes inúteis.
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * START_VH;
      const end = vh * END_VH;
      const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      const right = Math.round((1 - progress) * 1000) / 10;
      if (right !== lastRight) {
        lastRight = right;
        fill.style.clipPath = `inset(0 ${right}% 0 0)`;
      }
      raf = requestAnimationFrame(frame);
    };

    // IO ativa/desativa o loop: o rAF só roda enquanto o elemento
    // está na viewport (fora dela o estado congela onde parou).
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (!entry) return;
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      fill.style.clipPath = "";
    };
  }, []);

  const Tag = as as ElementType;

  return (
    <Tag
      ref={rootRef}
      className={className ? `${styles.root} ${className}` : styles.root}
    >
      <span className={styles.base}>{children}</span>
      <span className={styles.fill} aria-hidden="true">
        {children}
      </span>
    </Tag>
  );
}
