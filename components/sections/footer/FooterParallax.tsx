"use client";

import type { ReactNode } from "react";
import styles from "./Footer.module.css";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";

/**
 * FooterParallax — o parallax de entrada do rodapé (S11).
 *
 * Fórmula MEDIDA (awsmd-motion.json → footer-parallax, corrigida em
 * DEC-021 §2): o conteúdo começa a −50 % da PRÓPRIA altura e viaja a
 * METADE da velocidade do scroll, chegando a 0 quando a base do wrapper
 * alinha com a base da viewport:
 *
 *     l = min(0, scrolled * 0.5 − 0.5 * h)      com scrolled = h − (bottom − vh)
 *       = 0.5 * min(0, vh − bottom)             ← a forma que dá para medir
 *
 * (o valor de −37 % que estava registrado antes era a leitura de um
 * translate3d capturado no meio do curso, não o parâmetro.)
 *
 * O wrapper PRECISA de `overflow: hidden` — sem ele o deslocamento inicial
 * deixa um vão visível embaixo do conteúdo.
 *
 * Track do loop COMPARTILHADO (useScrollTimeline): nenhum rAF novo (teto
 * do projeto: 2 loops persistentes). Mede o rect do WRAPPER e escreve no
 * TRACK — medir o próprio elemento transformado realimentaria a leitura.
 * L5: o ScrollProvider não monta o loop sob reduced-motion, então o
 * conteúdo fica em translateY(0), que é o estado declarado no CSS.
 */
export default function FooterParallax({ children }: { children: ReactNode }) {
  const attachTrack = useScrollTimeline<number>({
    read: (el, { vh }) => {
      const host = el.parentElement;
      if (!host) return 0;
      const rect = host.getBoundingClientRect();
      const l = 0.5 * Math.min(0, vh - rect.bottom);
      return Math.round(Math.max(-0.5 * rect.height, l));
    },
    write: (el, y) => {
      (el as HTMLElement).style.transform = `translate3d(0, ${y}px, 0)`;
    },
    promote: true,
  });

  return (
    <div className={styles.parallax}>
      <div ref={attachTrack} className={styles.parallaxTrack}>
        {children}
      </div>
    </div>
  );
}
