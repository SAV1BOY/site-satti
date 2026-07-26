"use client";

import { useRef, type PointerEvent } from "react";

import FillText from "@/components/ui/FillText";
import { useMethodFocus } from "./MethodFocus";
import styles from "./About.module.css";

/**
 * AboutStatements — os statements da S5 em UM slot com crossfade.
 *
 * Duas mudanças, e as duas são de paridade (não de gosto):
 *
 * 1. ERA UMA PILHA DE TRÊS. A spec (`about.fillTextSlider`) é um slider em
 *    fade: UM statement por vez. Empilhar o que o modelo põe em slider é
 *    metade do excesso de altura que fazia a S5 ser o segundo maior desvio de
 *    paridade do site.
 * 2. O slot é dirigido pelo anel do grafo (DEC-021 §7): hover/foco no anel `i`
 *    faz crossfade para o statement `i`. É a interação real da seção.
 *
 * NÃO usa Swiper, apesar de a spec anotar `library: swiper`. Três razões, na
 * ordem em que pesam:
 * - `effect: "fade"` + `crossFade: true` + `speed: 400` É uma transição de
 *   `opacity` de 400 ms. Aqui ela custa 4 linhas de CSS e zero KB — o Swiper
 *   já está no bundle por causa da S9, mas o módulo EffectFade e o CSS dele
 *   não, e a spec é uma MEDIÇÃO do modelo, não um requisito de biblioteca
 *   (mesma leitura que fez o DEC-021 §1 recusar GSAP/ScrollTrigger).
 * - a paginação do Swiper vem com strings em inglês embutidas na lib
 *   ("Go to slide {{index}}"); a S9 teve de marcar os dots `aria-hidden` por
 *   isso (L1). Aqui os controles são nomeados por `aria-labelledby` apontando
 *   para o PRÓPRIO statement — copy oficial, nome perfeito, zero invenção.
 * - o `autoHeight` do Swiper animaria `height` (layout por frame, L10). Aqui o
 *   empilhamento é `grid-area: 1/1`, então a altura do slot é a do statement
 *   mais alto e NÃO muda ao trocar de slide.
 *
 * `allowTouchMove` da spec entra como swipe de ponteiro (~15 linhas), porque
 * sem ele o único caminho de troca no toque seria o grafo — que é justamente o
 * que a spec critica no modelo.
 *
 * L5: a transição mora em no-preference no CSS Module; em reduced-motion a
 * troca é instantânea, que é o estado estático declarado.
 */

/** Deslocamento mínimo (px) para um arrasto contar como troca de statement. */
const SWIPE_THRESHOLD = 40;

interface AboutStatementsProps {
  /** about.paragraphs — 3 statements oficiais (L1). */
  paragraphs: ReadonlyArray<string>;
}

export default function AboutStatements({ paragraphs }: AboutStatementsProps) {
  const { active, activate, statementsId } = useMethodFocus();
  const start = useRef<{ x: number; y: number } | null>(null);

  const index = Math.min(active, Math.max(0, paragraphs.length - 1));

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    start.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const from = start.current;
    start.current = null;
    if (!from) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    // Só conta como swipe se o gesto for claramente horizontal — assim um
    // scroll que começou sobre o texto continua sendo scroll.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    const next = dx < 0 ? index + 1 : index - 1;
    if (next >= 0 && next < paragraphs.length) activate(next);
  };

  return (
    <div className={styles.statements}>
      <div
        id={statementsId}
        className={styles.statementStack}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {paragraphs.map((statement, i) => (
          <div
            key={statement}
            id={`${statementsId}-${i}`}
            className={styles.statementSlide}
            data-on={i === index ? "true" : undefined}
            /* Fora da árvore de acessibilidade quando invisível: o leitor de
               tela lê UM statement, igual ao que se vê. Os outros continuam
               alcançáveis pelos controles abaixo e pelos passos do método. */
            aria-hidden={i === index ? undefined : "true"}
          >
            <FillText className={styles.statement}>{statement}</FillText>
          </div>
        ))}
      </div>

      {/* Paginação real (a do modelo é desabilitada, e sem ela o conteúdo fica
          inalcançável sem o grafo). Cada controle é nomeado pelo statement que
          seleciona — copy oficial via aria-labelledby, nada inventado. */}
      <ul className={styles.statementDots}>
        {paragraphs.map((statement, i) => (
          <li key={statement}>
            <button
              type="button"
              className={styles.statementDot}
              aria-labelledby={`${statementsId}-${i}`}
              aria-current={i === index ? "true" : undefined}
              data-on={i === index ? "true" : undefined}
              onClick={() => activate(i)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
