"use client";

import { createContext, type RefObject } from "react";

/** Snapshot lido UMA vez por frame e compartilhado por todos os tracks. */
export interface ScrollFrame {
  scrollY: number;
  vh: number;
  /** Contador de frames — útil para throttle interno de um track. */
  tick: number;
}

/* Estrutura mínima que o registry precisa conhecer de um track. O tipo real,
   genérico e documentado, vive em hooks/useScrollTimeline.ts; aqui usamos a
   forma apagada para evitar dependência circular entre provider e hook. */
export interface RegisteredTrack {
  read: (el: Element, frame: ScrollFrame) => unknown;
  write: (el: Element, value: unknown) => void;
  eq?: (a: unknown, b: unknown) => boolean;
  gate?: IntersectionObserverInit;
  enabled?: boolean;
  promote?: boolean;
}

export interface ScrollTimelineRegistry {
  register: (el: Element, track: RefObject<RegisteredTrack>) => void;
  unregister: (el: Element) => void;
}

export const ScrollTimelineContext =
  createContext<ScrollTimelineRegistry | null>(null);
