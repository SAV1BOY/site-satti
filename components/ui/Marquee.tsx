import type { CSSProperties, ReactNode } from "react";
import styles from "./Marquee.module.css";

/**
 * Marquee — trilho CSS-only com conteúdo duplicado.
 *
 * Server Component (sem "use client"): a animação é 100% CSS
 * (translateX 0 → -50%, linear, infinita). A segunda cópia é
 * aria-hidden e existe apenas para fechar o loop visual.
 *
 * Reduced-motion (L5): animação nunca é declarada fora de
 * @media (prefers-reduced-motion: no-preference) — o fallback é o
 * trilho parado com a primeira cópia visível.
 *
 * Referência visual: S3 ValuesStrip Var A (paper) e marquee de
 * logos da S5 no handoff (20s/24s linear · loop via padding-right).
 */

type MarqueeStyle = CSSProperties & {
  "--marquee-duration": string;
  "--marquee-gap": string;
};

interface MarqueeProps {
  children: ReactNode;
  /** Duração de uma volta completa, em segundos. Default: 20. */
  speed?: number;
  /** Inverte o sentido do deslocamento. Default: false. */
  reverse?: boolean;
  /** Espaço entre itens e entre as cópias. Default: var(--sp-lg). */
  gap?: string;
  /** Classe extra no wrapper (altura/bordas ficam por conta da seção). */
  className?: string;
}

export default function Marquee({
  children,
  speed = 20,
  reverse = false,
  gap = "var(--sp-lg)",
  className,
}: MarqueeProps) {
  const style: MarqueeStyle = {
    "--marquee-duration": `${speed}s`,
    "--marquee-gap": gap,
  };

  const trackClass = reverse
    ? `${styles.track} ${styles.reverse}`
    : styles.track;

  return (
    <div
      className={className ? `${styles.marquee} ${className}` : styles.marquee}
      style={style}
    >
      <div className={trackClass}>
        <div className={styles.copy}>{children}</div>
        <div className={styles.copy} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
