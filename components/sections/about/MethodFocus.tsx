"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * MethodFocus — o estado que liga o grafo do método aos statements da S5.
 *
 * É A FEATURE QUE FALTAVA (DEC-021 §7): no modelo, passar o ponteiro num anel
 * faz CROSSFADE do statement da seção para o índice daquele anel. Era o que a
 * seção FAZ, e a SATTI não tinha — tinha 3 statements empilhados e um diagrama
 * decorativo ao lado, sem relação entre os dois.
 *
 * O estado vive aqui, e não em `About.tsx`, por dois motivos:
 * - `About` é Server Component (L11) e continua sendo: este provider recebe a
 *   árvore inteira como `children`, então os stat-cards, o `<ul>` de métricas e
 *   o CTA seguem renderizando no servidor. Só os dois consumidores
 *   (`AboutStatements` e `MethodGraph`) são client.
 * - os dois consumidores estão em COLUNAS DIFERENTES do grid de conteúdo, com
 *   markup de servidor entre eles. Um provider é a única forma de compartilhar
 *   o estado sem transformar a seção toda em client island.
 *
 * `statementsId` sai daqui (não de cada consumidor) porque é o alvo do
 * `aria-controls` dos botões de passo do MethodGraph e o `id` da região dos
 * statements — os dois lados precisam do MESMO id.
 */

interface MethodFocusValue {
  /** Índice do anel rotulado ativo (0…2). Nunca nulo — ver nota abaixo. */
  active: number;
  /** Handler ÚNICO: hover no anel, clique e foco no botão de passo caem aqui. */
  activate: (index: number) => void;
  /** id da região de statements — alvo do aria-controls dos botões. */
  statementsId: string;
}

const MethodFocusContext = createContext<MethodFocusValue | null>(null);

/**
 * `active` começa em 0 e nunca volta a ser nulo. No modelo o grafo nasce sem
 * rótulo nenhum e só revela no hover, o que deixa a seção vazia no primeiro
 * paint e inalcançável sem ponteiro. Aqui o primeiro anel já está aberto: o
 * grafo nasce legível, o primeiro statement nasce visível, e a interação passa
 * a TROCAR de anel em vez de LIGAR o conteúdo.
 */
export function MethodFocusProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const statementsId = `${useId()}-statements`;

  const activate = useCallback((index: number) => {
    setActive((current) => (current === index ? current : index));
  }, []);

  const value = useMemo<MethodFocusValue>(
    () => ({ active, activate, statementsId }),
    [active, activate, statementsId],
  );

  return (
    <MethodFocusContext.Provider value={value}>
      {children}
    </MethodFocusContext.Provider>
  );
}

/** Lança se usado fora do provider — erro de composição, não de runtime silencioso. */
export function useMethodFocus(): MethodFocusValue {
  const value = useContext(MethodFocusContext);
  if (!value) {
    throw new Error("useMethodFocus precisa de um <MethodFocusProvider> acima.");
  }
  return value;
}
