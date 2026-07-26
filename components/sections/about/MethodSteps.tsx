"use client";

import { useMethodFocus } from "./MethodFocus";
import { groupMethodLabels } from "./method-groups";
import styles from "./About.module.css";

/**
 * MethodSteps — a `<ul>` que torna o grafo do método alcançável.
 *
 * O modelo põe os rótulos dos nós num pseudo-elemento
 * `content: attr(data-label)` com `visibility: hidden` e dispara tudo por
 * `onMouseEnter` em `<div>`. Consequência medida no bundle deles: teclado e
 * leitor de tela não alcançam NENHUM dos rótulos nem NENHUM dos statements. É
 * o pior defeito da seção, e a instrução foi explícita: não repetir.
 *
 * A inversão que fecha o problema:
 * - a informação vive AQUI — os 10 passos oficiais de `about.methodNodes`,
 *   agrupados por anel (4 / 3 / 3), cada um um `<button type="button">`;
 * - `aria-controls` aponta para a região dos statements e `aria-expanded` diz
 *   se o anel daquele passo é o aberto;
 * - `onFocus` ativa junto com `onMouseEnter` e `onClick`: é o que faz Tab e
 *   hover produzirem exatamente o mesmo resultado, com um handler só.
 *
 * Sem `aria-live` na região dos statements: com 10 botões, anunciar a cada Tab
 * seria ruído — o `aria-expanded` do próprio botão já é o sinal de estado.
 *
 * No mobile esta lista é a fonte primária: abaixo de 768px o grafo perde os
 * rótulos (14 unidades de viewBox em 335px de caixa dão ~7px reais).
 */

interface MethodStepsProps {
  /** about.methodNodes — os 10 passos oficiais, na ordem do JSON. */
  labels: ReadonlyArray<string>;
}

export default function MethodSteps({ labels }: MethodStepsProps) {
  const { active, activate, statementsId } = useMethodFocus();
  const groups = groupMethodLabels(labels);

  return (
    <ul className={styles.methodList}>
      {groups.map((group, index) => (
        <li
          key={`ring-${index}`}
          className={styles.methodGroup}
          data-on={index === active ? "true" : undefined}
        >
          <ul className={styles.methodSteps}>
            {group.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className={styles.methodStep}
                  aria-controls={statementsId}
                  aria-expanded={index === active}
                  onClick={() => activate(index)}
                  onMouseEnter={() => activate(index)}
                  onFocus={() => activate(index)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
