"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionOk } from "@/hooks/useMotionOk";
import styles from "./Services.module.css";

/**
 * ServicesDeck — coreografia "cards sobrepostos no scroll" da S4
 * (Atlas 03 + spec §6-W3). Client child mínimo (L11): os cards chegam
 * SERVER-RENDERED como children; aqui só vive o efeito de scroll.
 *
 * Desktop (≥1024px) com motion ok:
 * - O deck vira um trilho de 220vh com stage sticky (CSS via
 *   [data-active]); os cards 2 e 3 começam EMPILHADOS sobre o card 1
 *   com offset visível de 40px entre eles ("stack com offset ~40px")
 *   e deslizam para a fila final com sobreposição -40px (comp) ao
 *   longo do pin.
 * - Progresso: IO liga/desliga rAF; o frame lê o rect do trilho e
 *   escreve APENAS transform: translateX (L10) nos cards móveis.
 *   Mapeamento linear com o scroll (scroll é o easing — mesmo padrão
 *   da AutomationLine); janelas escalonadas por card.
 *
 * Estado base (SSR / reduced-motion / <1024px): nenhum atributo,
 * nenhum transform — fila final desktop / pilha vertical mobile,
 * exatamente o estado estático das comps (L5).
 */

const DESKTOP_MQ = "(min-width: 1024px)";

/** Offset visível entre cartas no stack = sobreposição final (comp). */
const LIP = 40;

/** Janela [início, fim] do progresso do pin em que cada card móvel viaja. */
const DEAL_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [0, 0.6],
  [0.35, 0.95],
];

export default function ServicesDeck({ children }: { children: ReactNode }) {
  const motionOk = useMotionOk();
  const [desktop, setDesktop] = useState(false);
  const deckRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MQ);
    const sync = () => {
      setDesktop(mql.matches);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => {
      mql.removeEventListener("change", sync);
    };
  }, []);

  const active = motionOk && desktop;

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || !active) return;

    const moving = Array.from(
      deck.querySelectorAll<HTMLElement>("[data-deck-card]"),
    ).slice(1);
    if (moving.length === 0) return;

    let raf = 0;
    let lastP = -1;

    const frame = () => {
      const rect = deck.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const raw = travel > 0 ? -rect.top / travel : 1;
      const p = Math.round(Math.min(1, Math.max(0, raw)) * 1000) / 1000;

      if (p !== lastP) {
        lastP = p;
        moving.forEach((card, i) => {
          const win =
            DEAL_WINDOWS[Math.min(i, DEAL_WINDOWS.length - 1)] ?? [0, 1];
          const [a, b] = win;
          const local =
            b > a ? Math.min(1, Math.max(0, (p - a) / (b - a))) : 1;

          if (local >= 1) {
            card.style.transform = "";
            return;
          }
          // Posição inicial: card i (1-based entre os móveis) empilhado
          // à esquerda com lip de 40px → shift = -(i+1) × (largura − 80).
          const width = card.getBoundingClientRect().width;
          const shift = -(i + 1) * (width - 2 * LIP) * (1 - local);
          card.style.transform = `translateX(${Math.round(shift * 10) / 10}px)`;
        });
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "20% 0px 20% 0px" },
    );
    io.observe(deck);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      moving.forEach((card) => {
        card.style.transform = "";
      });
    };
  }, [active]);

  return (
    <div
      ref={deckRef}
      className={styles.deck}
      data-active={active ? "true" : undefined}
    >
      <div className={styles.stage}>
        <div className={styles.row}>{children}</div>
      </div>
    </div>
  );
}
