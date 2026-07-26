"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import {
  ScrollTimelineContext,
  type RegisteredTrack,
  type ScrollTimelineRegistry,
  type ScrollFrame,
} from "./scroll-timeline-context";

/**
 * ScrollProvider — dono do scroll suave E do loop scroll-linked compartilhado.
 *
 * Substitui o LenisProvider. Existe por três razões medidas:
 *
 * 1. **UM loop em vez de dez.** O build v1 rodava 10 call sites distintos de
 *    requestAnimationFrame (medido por `npm run parity:dom`, teto do gate = 3):
 *    5 AutomationLine + FillText por instância + FooterHat + ServicesDeck +
 *    CursorProvider + LenisProvider. Cada um chamava getBoundingClientRect() no
 *    próprio callback, então a página fazia vários flushes de layout por frame.
 *
 * 2. **Fases read/write separadas.** Todos os `read` rodam, depois todos os
 *    `write`. Um flush de layout por frame, por construção. É o que o
 *    ScrollTrigger faz bem e o que loops hand-rolled erram — e é por isso que
 *    não adotamos GSAP (DEC-021 §1: o modelo também é hand-rolled, e
 *    ScrollTrigger custaria ~30 KB gzip mais um refresh() forçando layout em
 *    ~12 triggers no init, que é a margem inteira do TBT de 80 ms).
 *
 * 3. **O loop estaciona.** `active` é mantido por IntersectionObserver; quando
 *    esvazia, cancelAnimationFrame. Os N loops antigos giravam a 60 Hz mesmo com
 *    nada em tela.
 *
 * Bônus de correção: `lenis.raf(t)` roda no MESMO loop, ANTES da fase de leitura.
 * Com dois loops separados eles corriam soltos e as leituras podiam estar um
 * frame atrasadas em relação à posição que o Lenis acabou de escrever.
 *
 * Sob `prefers-reduced-motion: reduce` nada disso monta: sem Lenis, sem loop,
 * sem tracks. O estado estático declarado no CSS é o estado final (L5).
 *
 * O CursorProvider mantém o loop próprio de propósito — ele precisa rodar em
 * pointermove com nada em tela e scroll parado; dobrá-lo aqui forçaria o loop
 * compartilhado a girar permanentemente. Teto do projeto: 2 loops persistentes.
 */

const REDUCE_MQ = "(prefers-reduced-motion: reduce)";
/** Convenção única de gate de track scroll-linked no projeto. */
const DEFAULT_GATE: IntersectionObserverInit = {
  rootMargin: "15% 0px 15% 0px",
  threshold: 0,
};

interface Entry {
  el: Element;
  track: { current: RegisteredTrack };
  last: unknown;
  hasLast: boolean;
  promoted: boolean;
}

export default function ScrollProvider({ children }: { children: ReactNode }) {
  /* Estado só para decidir MONTAR ou não. Depois disso o loop é imperativo. */
  const [reduce, setReduce] = useState(true); // SSR/1º paint = conservador (L5)

  /* Estruturas vivas do loop. Ficam em refs para não causar render. */
  const entries = useRef(new Map<Element, Entry>());
  const active = useRef(new Set<Element>());
  const gates = useRef(new Map<string, IntersectionObserver>());
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const tickRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);
  /* Preenchido pelo effect. Antes disso, register() só popula `entries` e o
     effect observa tudo que já estiver lá quando montar. */
  const observeRef = useRef<((el: Element, gate: IntersectionObserverInit) => void) | null>(null);
  const kickRef = useRef<(() => void) | null>(null);

  /* O registry é criado UMA vez e é estável para sempre. Precisa ser state com
     inicializador lazy, não ref: (a) se fosse criado dentro do effect, o value
     do Provider seria null no primeiro render e nada dispararia um re-render
     depois — os consumidores nunca o receberiam; (b) ler `ref.current` no render
     é proibido por `react-hooks/refs`. State que nunca muda pode ser lido no
     render e é o padrão idiomático para singleton estável. As closures abaixo
     leem refs, que são estáveis por definição. */
  const [registry] = useState<ScrollTimelineRegistry>(() => {
    return {
      register(el, track) {
        if (track.current?.enabled === false) return;
        /* Registro é por elemento: um duplo-registro do StrictMode SUBSTITUI,
           não acumula. */
        entries.current.set(el, {
          el,
          track: track as { current: RegisteredTrack },
          last: undefined,
          hasLast: false,
          promoted: false,
        });
        observeRef.current?.(el, track.current?.gate ?? DEFAULT_GATE);
      },
      unregister(el) {
        const entry = entries.current.get(el);
        if (entry?.promoted) (el as HTMLElement).style.willChange = "";
        entries.current.delete(el);
        active.current.delete(el);
        for (const io of gates.current.values()) io.unobserve(el);
      },
    };
  });

  useEffect(() => {
    const mql = window.matchMedia(REDUCE_MQ);
    const sync = () => setReduce(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce) return;

    /* Aliases locais dos containers. São os MESMOS objetos durante toda a vida do
       componente (criados uma vez por useRef), então isto é idêntico em
       comportamento — e satisfaz `react-hooks/exhaustive-deps`, que não sabe
       distinguir um container estável de um nó renderizado pelo React. */
    const entryMap = entries.current;
    const activeSet = active.current;
    const gateMap = gates.current;

    const lenis = new Lenis({ lerp: 0.12 });
    lenisRef.current = lenis;

    const kick = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      rafRef.current = requestAnimationFrame(frame);
    };

    /* Buffer de valores reusado entre frames — zero alocação no hot path. */
    const pending: Array<[Entry, unknown]> = [];

    const frame = (time: number) => {
      /* Lenis PRIMEIRO: as leituras abaixo veem a posição já escrita. */
      lenis.raf(time);

      if (activeSet.size === 0) {
        runningRef.current = false; // o loop estaciona
        return;
      }

      const snapshot: ScrollFrame = {
        scrollY: window.scrollY,
        vh: window.innerHeight,
        tick: ++tickRef.current,
      };

      /* --- FASE DE LEITURA: só rect/estilo, nenhuma escrita --------------- */
      pending.length = 0;
      for (const el of activeSet) {
        const entry = entryMap.get(el);
        if (!entry) continue;
        const t = entry.track.current;
        if (t.enabled === false) continue;
        pending.push([entry, t.read(el, snapshot)]);
      }

      /* --- FASE DE ESCRITA: só estilo, nenhuma leitura de layout ---------- */
      for (const [entry, value] of pending) {
        const t = entry.track.current;
        const same = entry.hasLast && (t.eq ? t.eq(entry.last, value) : Object.is(entry.last, value));
        if (same) continue;
        entry.last = value;
        entry.hasLast = true;
        t.write(entry.el, value);
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    /* Um IntersectionObserver por configuração distinta de gate, não por track. */
    const observerFor = (gate: IntersectionObserverInit) => {
      const key = JSON.stringify(gate);
      let io = gateMap.get(key);
      if (io) return io;
      io = new IntersectionObserver((records) => {
        for (const rec of records) {
          const entry = entryMap.get(rec.target);
          if (!entry) continue;
          if (rec.isIntersecting) {
            activeSet.add(rec.target);
            if (entry.track.current.promote && !entry.promoted) {
              (rec.target as HTMLElement).style.willChange = "transform";
              entry.promoted = true;
            }
          } else {
            activeSet.delete(rec.target);
            if (entry.promoted) {
              (rec.target as HTMLElement).style.willChange = "";
              entry.promoted = false;
            }
          }
        }
        if (activeSet.size > 0) kick();
      }, gate);
      gateMap.set(key, io);
      return io;
    };

    /* Liga o registry (criado no render) a este ciclo de vida do loop. */
    observeRef.current = (el, gate) => observerFor(gate).observe(el);
    kickRef.current = kick;

    /* Tracks que se registraram ANTES deste effect (1º render, ou o flip de
       reduced-motion) já estão em `entries` — observe todos agora. */
    for (const [el, entry] of entryMap) {
      observerFor(entry.track.current?.gate ?? DEFAULT_GATE).observe(el);
    }

    return () => {
      observeRef.current = null;
      kickRef.current = null;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      runningRef.current = false;
      for (const io of gateMap.values()) io.disconnect();
      gateMap.clear();
      /* Devolve TODO estilo inline que o loop escreveu. Sem isto um remount de
         StrictMode ou um flip de reduced-motion deixaria layers e transforms
         órfãos — e o estado limpo é exatamente o estado reduced-motion, então as
         duas rotas convergem por construção em vez de por disciplina. */
      for (const [el, entry] of entryMap) {
        const s = (el as HTMLElement).style;
        if (entry.promoted) s.willChange = "";
        entry.promoted = false;
        entry.hasLast = false;
        entry.last = undefined;
        s.transform = "";
        s.clipPath = "";
        s.strokeDashoffset = "";
        s.strokeDasharray = "";
      }
      /* `entries` NÃO é limpo: as inscrições pertencem aos callback refs dos
         consumidores, que não disparam de novo. Se limpássemos aqui, um flip de
         reduced-motion (ou o remount do StrictMode) mataria todos os tracks
         permanentemente. Só o estado do LOOP é descartado. */
      activeSet.clear();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  return (
    <ScrollTimelineContext.Provider value={registry}>
      {children}
    </ScrollTimelineContext.Provider>
  );
}
