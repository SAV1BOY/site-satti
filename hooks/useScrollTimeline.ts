"use client";

import { useCallback, useContext, useEffect, useRef, type RefObject } from "react";
import {
  ScrollTimelineContext,
  type RegisteredTrack,
  type ScrollFrame,
} from "@/components/providers/scroll-timeline-context";

export type { ScrollFrame };

/**
 * Um track scroll-linked no loop compartilhado.
 *
 * A separação read/write é o ponto inteiro: o provider roda TODOS os `read` e só
 * depois TODOS os `write`, então a página tem um flush de layout por frame em vez
 * de um por componente. Ler no `write` (ou escrever no `read`) desfaz isso e
 * reintroduz layout thrashing — é o erro que loops hand-rolled cometem.
 */
export interface ScrollTrack<T> {
  /** FASE DE LEITURA. Só leitura de rect/estilo. NUNCA escreva aqui. */
  read: (el: Element, frame: ScrollFrame) => T;
  /** FASE DE ESCRITA. Só escrita de estilo. NUNCA leia layout aqui. */
  write: (el: Element, value: T) => void;
  /** Pula o write quando o valor não mudou. Default: Object.is. */
  eq?: (a: T, b: T) => boolean;
  /** Gate de IntersectionObserver. Default: rootMargin 15% (convenção do projeto). */
  gate?: IntersectionObserverInit;
  /** false → o track nunca é instalado (reduced-motion, breakpoint). */
  enabled?: boolean;
  /** Promove a layer enquanto ativo. O provider LIMPA no teardown. */
  promote?: boolean;
}

/**
 * Registra um elemento num track do loop compartilhado.
 *
 * Retorna um CALLBACK REF — nunca um objeto contendo refs, que o React 19 /
 * Compiler proíbe passar como prop.
 *
 * ```tsx
 * const ref = useScrollTimeline<number>({
 *   read: (el, { vh }) => {
 *     const r = el.getBoundingClientRect();
 *     return Math.round(Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))) * 1000) / 1000;
 *   },
 *   write: (el, p) => { (el as HTMLElement).style.transform = `translate3d(0,${p * -40}px,0)`; },
 *   enabled: motionOk,
 *   promote: true,
 * });
 * return <div ref={ref} />;
 * ```
 */
export function useScrollTimeline<T>(track: ScrollTrack<T>): (el: Element | null) => void {
  const registry = useContext(ScrollTimelineContext);

  /* O track vive numa ref para que redeclarar `read`/`write` a cada render não
     re-registre o elemento. O provider lê sempre o valor atual.
     A escrita acontece num effect, não no corpo do render: `react-hooks/refs`
     proíbe mutar ref durante o render (React 19). Não há staleness prática —
     useRef já inicializa com o primeiro track, e o loop só roda depois que o
     IntersectionObserver dispara, o que é posterior aos effects. */
  const latest = useRef(track);
  useEffect(() => {
    latest.current = track;
  });

  const current = useRef<Element | null>(null);

  return useCallback(
    (el: Element | null) => {
      if (!registry) return;
      /* Desregistra o nó anterior ANTES de registrar o novo: em StrictMode o
         callback ref é chamado com null e depois com o nó, e sem isto o
         registro duplicaria. */
      if (current.current && current.current !== el) {
        registry.unregister(current.current);
      }
      current.current = el;
      /* Apagamento de tipo na fronteira. É são: o provider só devolve ao `write`
         o valor que o `read` do MESMO track produziu, então o T nunca cruza
         tracks. Sem o cast, `write: (el, value: T)` é contravariante e não
         satisfaz `(el, value: unknown)`. */
      if (el) registry.register(el, latest as unknown as RefObject<RegisteredTrack>);
    },
    [registry],
  );
}
