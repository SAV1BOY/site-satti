"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionOk } from "@/hooks/useMotionOk";
import styles from "./Services.module.css";

/**
 * ServicesDeck — coreografia "cards sobrepostos no scroll" da S4
 * (Atlas 03 + spec §6-W3). Client child mínimo (L11): os cards chegam
 * SERVER-RENDERED como children; aqui só vive o efeito de scroll.
 *
 * v2 · O TRILHO DE 220vh FOI REMOVIDO (DEC-021 §2). O modelo não pina
 * nada — fatia-de-scroll ÷ fatia-de-altura ≈ 1,0 em todas as seções
 * dele — e os 3 cards dele são uma fila flex simples sem coreografia.
 * O trilho fazia esta seção ocupar 2,62 viewports e 23,1% da altura da
 * página contra 7,9% do modelo: a maior violação de paridade do v1.
 *
 * Desktop (≥1024px) com motion ok:
 * - Os cards 2 e 3 começam EMPILHADOS sobre o card 1 com offset visível
 *   de 40px e deslizam para a fila final com sobreposição -40px (comp).
 * - Progresso agora vem da PASSAGEM NATURAL da seção pela viewport, não
 *   de um pin: p = (vh − rect.top) / (vh + rect.height), então p≈0,5
 *   quando a seção está centrada. IO liga/desliga rAF; o frame lê o rect
 *   e escreve APENAS transform: translateX (L10) nos cards móveis.
 *   Mapeamento linear (scroll é o easing — mesmo padrão da AutomationLine).
 *
 * Estado base (SSR / reduced-motion / <1024px): nenhum atributo,
 * nenhum transform — fila final desktop / pilha vertical mobile,
 * exatamente o estado estático das comps (L5).
 */

const DESKTOP_MQ = "(min-width: 1024px)";

/** Offset visível entre cartas no stack = sobreposição final (comp). */
const LIP = 40;

/**
 * Janela [início, fim] do progresso da passagem em que cada card móvel viaja.
 * Recalibradas no v2: com o pin, o progresso ia de 0 a 1 ao longo do trilho e
 * dava para terminar em 0,95. Na passagem natural, p ≈ 0,5 é a seção centrada
 * — a fila final tem de estar formada AÍ, não quando a seção já está saindo.
 */
const DEAL_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [0.15, 0.5],
  [0.3, 0.65],
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
      const vh = window.innerHeight;
      // Passagem natural: p = 0 quando o topo da seção toca a base da
      // viewport, p = 1 quando a base da seção sai pelo topo. p ≈ 0,5 com a
      // seção centrada — é aí que a fila final precisa estar formada.
      const travel = vh + rect.height;
      const raw = travel > 0 ? (vh - rect.top) / travel : 1;
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
      // 15% é a convenção única de gate de track scroll-linked no projeto
      // (mesma da AutomationLine): o track fica vivo antes do elemento estar
      // visível, então o primeiro valor escrito não é um salto.
      { rootMargin: "15% 0px 15% 0px" },
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
