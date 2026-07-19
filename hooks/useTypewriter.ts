"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * useTypewriter — máquina de escrever cíclica do hero (S1+S2).
 *
 * Ciclo com motion permitido (comp "S1+S2 Hero Desktop 1920.dc.html"):
 *   typing (90ms/char) → holding (1400ms) → deleting (45ms/char) →
 *   pausa de 240ms → próxima palavra → loop infinito.
 *
 * L5 — fallback reduced-motion: com `prefers-reduced-motion: reduce` o hook
 * devolve a PRIMEIRA palavra completa, estática, phase "holding", e NENHUM
 * timer é agendado. Esse mesmo estado é o render de servidor / primeiro paint
 * (sem flash de hero vazio antes da hidratação).
 *
 * O hook não renderiza nada — o caret (blaze, blink em steps(1)) é
 * responsabilidade do consumidor, que deve pausá-lo em reduced-motion.
 *
 * Uso de referência (hero): useTypewriter(["VENDER", "ATENDER", "OPERAR", "CRESCER"])
 */

export type TypewriterPhase = "typing" | "holding" | "deleting";

export interface UseTypewriterOptions {
  /** ms por caractere digitado. Default: 90 (comp). */
  typeMs?: number;
  /** ms por caractere apagado. Default: 45 (comp). */
  deleteMs?: number;
  /** ms segurando a palavra completa antes de apagar. Default: 1400 (comp). */
  holdMs?: number;
}

export interface UseTypewriterResult {
  /** Texto parcial/completo da palavra atual. */
  text: string;
  /** Índice da palavra atual em `words`. */
  wordIndex: number;
  /** Fase atual do ciclo. Em reduced-motion é sempre "holding". */
  phase: TypewriterPhase;
}

interface TypewriterState {
  text: string;
  wordIndex: number;
  phase: TypewriterPhase;
}

const DEFAULT_TYPE_MS = 90;
const DEFAULT_DELETE_MS = 45;
const DEFAULT_HOLD_MS = 1400;
/** Pausa entre apagar a última letra e começar a digitar a próxima palavra (comp: 240ms). */
const WORD_GAP_MS = 240;

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", onChange);
  return () => {
    mql.removeEventListener("change", onChange);
  };
}

const getReducedMotion = (): boolean => window.matchMedia(REDUCED_QUERY).matches;

/** Servidor/hidratação: trata como reduced → estado estático, sem timers (L5). */
const getServerReducedMotion = (): boolean => true;
/** Separador interno da chave de conteúdo (nunca ocorre em copy). */
const KEY_SEPARATOR = "\u001F";

export function useTypewriter(
  words: string[],
  opts?: UseTypewriterOptions,
): UseTypewriterResult {
  const typeMs = opts?.typeMs ?? DEFAULT_TYPE_MS;
  const deleteMs = opts?.deleteMs ?? DEFAULT_DELETE_MS;
  const holdMs = opts?.holdMs ?? DEFAULT_HOLD_MS;

  // Chave de CONTEÚDO: o ciclo só reinicia se as palavras mudarem de fato,
  // não a cada identidade nova de array vinda de um re-render do consumidor.
  const wordsKey = words.join(KEY_SEPARATOR);

  // Ref sincronizada para ler a lista atual dentro dos efeitos sem
  // depender da identidade do array (efeito declarado ANTES dos demais
  // para rodar primeiro na ordem de declaração).
  const wordsRef = useRef<readonly string[]>(words);
  useEffect(() => {
    wordsRef.current = words;
  });

  // Estado inicial (SSR + primeiro paint + fallback L5): primeira palavra
  // completa, estática.
  const [state, setState] = useState<TypewriterState>(() => ({
    text: words[0] ?? "",
    wordIndex: 0,
    phase: "holding",
  }));

  // Preferência de motion como external store: valor real já no primeiro
  // render pós-hidratação, sem setState em corpo de effect. No servidor e
  // durante a hidratação vale o snapshot "reduced" (estático).
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  // (Re)arma o ciclo quando a preferência de motion muda ou o conjunto de
  // palavras muda — ajuste de estado DURANTE o render (padrão React docs,
  // "adjusting state when props change"), nunca em effect.
  const [prevCycle, setPrevCycle] = useState({
    key: wordsKey,
    reduced: true,
  });
  if (prevCycle.key !== wordsKey || prevCycle.reduced !== reducedMotion) {
    setPrevCycle({ key: wordsKey, reduced: reducedMotion });
    const first = wordsKey.split(KEY_SEPARATOR)[0] ?? "";
    setState(
      reducedMotion
        ? // L5: palavra fixa, sem animação.
          { text: first, wordIndex: 0, phase: "holding" }
        : // Motion permitido: digita a primeira palavra do zero, como no comp.
          { text: "", wordIndex: 0, phase: "typing" },
    );
  }

  // Máquina de estados com setTimeout ENCADEADO: cada transição agenda a
  // próxima, e o cleanup limpa o timer pendente (unmount, mudança de deps,
  // troca de preferência de motion).
  useEffect(() => {
    if (reducedMotion) {
      return; // L5: reduced-motion → nenhum timer.
    }
    const list = wordsRef.current;
    if (list.length === 0) {
      return;
    }

    const { text, phase } = state;
    const word = list[state.wordIndex % list.length] ?? "";

    let delay: number;
    let advance: (prev: TypewriterState) => TypewriterState;

    if (phase === "typing") {
      if (text.length < word.length) {
        delay = typeMs;
        advance = (prev) => {
          const nextText = word.slice(0, prev.text.length + 1);
          return {
            ...prev,
            text: nextText,
            phase: nextText === word ? "holding" : "typing",
          };
        };
      } else {
        // Caso de borda (texto já completo em fase typing): normaliza.
        delay = 0;
        advance = (prev) => ({ ...prev, text: word, phase: "holding" });
      }
    } else if (phase === "holding") {
      delay = holdMs;
      advance = (prev) => ({ ...prev, phase: "deleting" });
    } else if (text.length > 0) {
      delay = deleteMs;
      advance = (prev) => ({ ...prev, text: prev.text.slice(0, -1) });
    } else {
      // Apagou tudo: pequena pausa e avança para a próxima palavra (loop).
      delay = WORD_GAP_MS;
      advance = (prev) => ({
        text: "",
        wordIndex: (prev.wordIndex + 1) % list.length,
        phase: "typing",
      });
    }

    const timer = window.setTimeout(() => {
      setState(advance);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [state, reducedMotion, typeMs, deleteMs, holdMs]);

  return { text: state.text, wordIndex: state.wordIndex, phase: state.phase };
}
