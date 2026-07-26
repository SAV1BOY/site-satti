"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionOk } from "@/hooks/useMotionOk";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";
import styles from "./Services.module.css";

/**
 * ServicesDeck — abertura dos cards da S4 pela passagem natural da seção.
 *
 * O TRILHO DE 220vh CONTINUA REMOVIDO (DEC-021 §2): nada no modelo é pinado, e
 * o rail fazia esta seção ocupar 2,62 viewports contra ~1,0 do modelo. Não há
 * `height`, não há `sticky`, e este componente não os recria.
 *
 * v2 (W11-C) · PORTADO PARA O LOOP COMPARTILHADO. A matemática é a mesma de
 * antes — p = (vh − rect.top) / (vh + rect.height), janelas por card, só
 * translateX. O que saiu foi o MOTOR: o `requestAnimationFrame` próprio e o
 * `IntersectionObserver` local. Eram um dos 7 call sites de rAF que o
 * `npm run parity:dom` acusa contra um teto de 3; agora isto é um track do
 * `useScrollTimeline`, com fase de leitura e fase de escrita separadas (um
 * flush de layout por frame na página inteira, não um por componente).
 *
 * DOIS DETALHES DO PORTE QUE NÃO SÃO ÓBVIOS:
 *
 * 1. `enabled` do track NÃO é usado. O `register()` do ScrollProvider descarta
 *    a inscrição quando `enabled === false`, e a inscrição acontece UMA vez, no
 *    callback ref. Como `desktop` só pode ser conhecido depois do mount
 *    (matchMedia), `enabled` seria `false` exatamente no instante do registro e
 *    o deck nunca voltaria a se inscrever. O gate mora dentro do `read`, que é
 *    relido do track a cada frame: fora do desktop ele devolve o sentinela e
 *    sequer mede o rect.
 * 2. O elemento inscrito é o DECK, mas quem recebe transform são os ITENS.
 *    O provider só devolve o estilo do elemento REGISTRADO no teardown, então a
 *    limpeza dos itens é do effect abaixo — é ele que garante que o estado
 *    reduced-motion (fila final, sem transform) e o estado desmontado sejam o
 *    mesmo estado.
 *
 * Estado base (SSR / reduced-motion / <1024px): nenhum atributo, nenhum
 * transform — fila final no desktop, pilha vertical no mobile.
 */

const DESKTOP_MQ = "(min-width: 1024px)";

/** Offset visível entre cartas no stack inicial, em px. */
const LIP = 40;

/**
 * Janela [início, fim] do progresso da passagem em que cada card móvel viaja.
 *
 * RECALIBRADAS (W11-C) contra a altura real da seção. Medido a 1920×1080 com o
 * card cheio de imagem: seção 890px, logo `travel = vh + 890 = 1970` e
 * `rect.top = vh − p·travel`. A seção está INTEIRA em tela só entre p ≈ 0,45 e
 * p ≈ 0,55 — e as janelas antigas ([0,15…0,5] e [0,3…0,65]) fechavam a fila
 * DEPOIS disso: medido, com a seção centrada (p ≈ 0,48) o card 3 ainda cobria o
 * card 2 em 92px e o card 2 cobria metade do card 3. O modelo mostra os três
 * cards lado a lado o tempo todo; um card ilegível durante toda a permanência
 * não é coreografia, é oclusão. A fila agora fecha em p = 0,42, enquanto a
 * seção ainda sobe pela viewport, e a permanência inteira é a fila final.
 */
const DEAL_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [0.06, 0.32],
  [0.14, 0.42],
];

/** Sentinela de "nada a escrever" — o eq do loop descarta writes repetidos. */
const IDLE = "";

export default function ServicesDeck({ children }: { children: ReactNode }) {
  const motionOk = useMotionOk();
  const [desktop, setDesktop] = useState(false);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const movingRef = useRef<HTMLElement[]>([]);

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

  /* Lista dos cards móveis (todos menos o primeiro) + a limpeza que devolve o
     estado da fila final quando o efeito sai de cena. */
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const moving = Array.from(
      deck.querySelectorAll<HTMLElement>("[data-deck-card]"),
    ).slice(1);
    movingRef.current = moving;
    return () => {
      for (const card of moving) card.style.transform = "";
    };
  }, [active]);

  /* O track é reconstruído a cada render e o provider lê sempre o mais recente,
     então fechar sobre `active` aqui é seguro — e é o gate real (ver nota 1). */
  const attach = useScrollTimeline<string>({
    read: (el, { vh }) => {
      if (!active) return IDLE;
      const moving = movingRef.current;
      if (moving.length === 0) return IDLE;

      const rect = el.getBoundingClientRect();
      const travel = vh + rect.height;
      const raw = travel > 0 ? (vh - rect.top) / travel : 1;
      const p = Math.min(1, Math.max(0, raw));

      let spec = "";
      for (let i = 0; i < moving.length; i++) {
        const phase = DEAL_WINDOWS[Math.min(i, DEAL_WINDOWS.length - 1)] ?? [
          0, 1,
        ];
        const [from, to] = phase;
        const local =
          to > from ? Math.min(1, Math.max(0, (p - from) / (to - from))) : 1;
        /* Posição inicial: card i (1-based entre os móveis) empilhado à
           esquerda com o lip de 40px visível. */
        const width = moving[i]?.getBoundingClientRect().width ?? 0;
        const shift =
          local >= 1 ? 0 : -(i + 1) * (width - 2 * LIP) * (1 - local);
        spec += `${i ? "|" : ""}${Math.round(shift * 10) / 10}`;
      }
      /* String de propósito: o eq default do loop (Object.is) já compara isto
         por valor, então não precisa de comparador próprio para um array. */
      return spec;
    },
    write: (_el, spec) => {
      if (spec === IDLE) return;
      const moving = movingRef.current;
      const parts = spec.split("|");
      for (let i = 0; i < moving.length; i++) {
        const card = moving[i];
        if (!card) continue;
        const px = Number(parts[i] ?? 0);
        card.style.transform = px === 0 ? "" : `translate3d(${px}px, 0, 0)`;
      }
    },
  });

  const setDeck = useCallback(
    (el: HTMLDivElement | null) => {
      deckRef.current = el;
      attach(el);
    },
    [attach],
  );

  return (
    <div
      ref={setDeck}
      className={styles.deck}
      data-active={active ? "true" : undefined}
    >
      <div className={styles.row}>{children}</div>
    </div>
  );
}
