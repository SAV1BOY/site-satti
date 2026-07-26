"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import SattiMark from "@/components/ui/SattiMark";
import styles from "./IntroAnimation.module.css";

/**
 * IntroAnimation — a entrada da página (o modelo tem, o v1 da SATTI não tinha).
 *
 * Três camadas sobem em cascata e um círculo com a marca cresce e sai crescendo.
 * A última camada é `--c-paper`, que É o fundo real da página, então o último
 * quadro da intro já é o site — não existe "fade do container" no fim.
 *
 * As restrições valem mais que a fidelidade, e cada uma tem um motivo medido:
 *
 * 1. **Não monta sob `prefers-reduced-motion: reduce`.** Não é "animação
 *    desligada": o componente devolve `null` e nem entra no DOM. O
 *    reduced-motion mede maxDiff 0,0000 nas 10 seções hoje, e a intro não pode
 *    ser o que estraga isso. O estado sem intro É o estado final.
 * 2. **Uma vez por SESSÃO, não por navegação.** `sessionStorage` — sem isso ela
 *    reapareceria a cada volta de `/en` para `/`, e uma boas-vindas repetida é
 *    obstáculo. Só `sessionStorage`, nunca `localStorage`: numa visita nova em
 *    outro dia ela deve aparecer de novo.
 * 3. **`pointer-events: none` sempre, e desmonta ao terminar.** Uma intro que
 *    sobrevive invisível é a classe de bug mais chata que existe (cliques que
 *    "não funcionam" no topo da página). O `onAnimationEnd` do círculo — que é
 *    a última animação a acabar — desmonta o componente inteiro.
 * 4. **Zero request.** Só CSS e o `SattiMark`, que já está no bundle. Nada de
 *    fonte, imagem ou fetch: o payload acima da dobra é 445 KiB no mobile e o
 *    LCP é o poster do hero — a intro não pode disputar essa banda.
 * 5. **Nenhum rAF.** É CSS puro. O teto do projeto é 3 loops persistentes e
 *    estamos exatamente em 3 (`npm run parity:dom` mede).
 *
 * Renderiza `null` no servidor: nada dela entra no HTML, então o SSR e a
 * hidratação não mudam e o `parity:dom` (que lê o DOM) não vê diferença.
 */

const SESSION_KEY = "satti:intro-vista";
const REDUCE_MQ = "(prefers-reduced-motion: reduce)";

/**
 * A decisão de tocar é tomada UMA vez por carregamento e nunca muda depois —
 * então é um external store, não estado derivado de effect.
 *
 * Por que não `useState` + `useEffect`: chamar `setState` no corpo de um effect
 * viola `react-hooks/set-state-in-effect` (React 19) e causa render em cascata.
 * Por que não `useState` com inicializador lazy: ele roda no render, e no
 * cliente devolveria `true` onde o servidor renderizou `null` — mismatch de
 * hidratação. `useSyncExternalStore` resolve os dois: usa o snapshot do
 * servidor durante a hidratação e só então troca para o do cliente. É o mesmo
 * padrão que o DEC-007 fixou para detecção de motion-preference.
 */
let cachedDecision: boolean | null = null;

function shouldPlayIntro(): boolean {
  if (cachedDecision !== null) return cachedDecision;
  let decision = false;
  if (typeof window !== "undefined") {
    if (!window.matchMedia(REDUCE_MQ).matches) {
      try {
        decision = sessionStorage.getItem(SESSION_KEY) === null;
      } catch {
        /* Modo privado ou storage bloqueado: sem memória de sessão não
           arriscamos repetir a intro em cada navegação — não toca. */
        decision = false;
      }
    }
  }
  cachedDecision = decision;
  return decision;
}

/** O store nunca notifica: a decisão é imutável dentro do carregamento. */
const subscribe = () => () => {};
const getServerSnapshot = () => false;

export default function IntroAnimation() {
  const shouldPlay = useSyncExternalStore(
    subscribe,
    shouldPlayIntro,
    getServerSnapshot,
  );
  /* Desmonta no fim da última animação. `setState` aqui vem de um EVENTO
     (onAnimationEnd), que é exatamente onde a regra permite. */
  const [done, setDone] = useState(false);

  /* Efeito só de side-effect: marca a sessão. Nenhum setState. */
  useEffect(() => {
    if (!shouldPlay) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage bloqueado — a intro já está tocando; nada a fazer. */
    }
  }, [shouldPlay]);

  if (!shouldPlay || done) return null;

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={`${styles.layer} ${styles.layer1}`} />
      <div className={`${styles.layer} ${styles.layer2}`} />
      <div className={`${styles.layer} ${styles.layer3}`} />
      <div
        className={styles.circle}
        /* O círculo é a última animação a terminar → é ele que desmonta tudo. */
        onAnimationEnd={() => setDone(true)}
      >
        <SattiMark size={128} className={styles.mark} />
      </div>
    </div>
  );
}
