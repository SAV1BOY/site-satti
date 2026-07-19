"use client";

import { useEffect, useRef } from "react";
import { useMotionOk } from "@/hooks/useMotionOk";
import styles from "./Footer.module.css";

/**
 * FooterHat — wordmark gigante decorativo com parallax sutil
 * (Atlas: "footer parallax hat").
 *
 * Client island mínima (L11): o Footer é Server Component; aqui mora
 * SÓ o efeito. Parallax: IntersectionObserver liga/desliga um loop rAF
 * que lê o rect do wrapper e escreve translate3d(0, y%, 0) no inner —
 * transform-only (L10), mapeamento linear do progresso de scroll (sem
 * tween; o easing é o do próprio dedo/roda).
 * L5: gated por useMotionOk — reduced-motion e SSR/primeiro paint =
 * estático (estado das comps), transform limpo.
 * A11y: puramente decorativo — wrapper aria-hidden (a marca legível é
 * a da coluna do footer).
 */

/** Curso do parallax em % da própria altura do hat (sutil). */
const HAT_FROM = 12;
const HAT_TO = -6;

interface FooterHatProps {
  /** Wordmark (footer.brand via next-intl no pai — copy nunca hardcoded, L1). */
  text: string;
}

export default function FooterHat({ text }: FooterHatProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const motionOk = useMotionOk();

  useEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner || !motionOk) return;

    let raf = 0;
    let lastY = Number.NaN;

    const frame = () => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 → topo do hat entrando pela base da viewport · 1 → base saindo
      // pelo topo (o footer é a última dobra: fica num trecho parcial).
      const progress = Math.min(
        1,
        Math.max(0, (vh - rect.top) / (vh + rect.height)),
      );
      const y =
        Math.round((HAT_FROM + (HAT_TO - HAT_FROM) * progress) * 100) / 100;
      if (y !== lastY) {
        lastY = y;
        inner.style.transform = `translate3d(0, ${y}%, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };

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
      inner.style.transform = "";
    };
  }, [motionOk]);

  return (
    <div ref={rootRef} className={styles.hat} aria-hidden="true">
      <span ref={innerRef} className={styles.hatInner}>
        {text}
      </span>
    </div>
  );
}
