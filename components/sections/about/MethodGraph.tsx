"use client";

import PulseCircle from "@/components/ui/PulseCircle";
import { useMethodFocus } from "./MethodFocus";
import { groupMethodLabels } from "./method-groups";
import styles from "./About.module.css";

/**
 * MethodGraph — só o desenho. É `role="img"` de propósito: ilustração, não
 * interface. Quem carrega a informação alcançável é o `MethodSteps`, na coluna
 * ao lado (ver o cabeçalho dele).
 *
 * O hover no anel é o trigger SECUNDÁRIO da seção e chama o MESMO `activate`
 * que os botões de passo — não existem dois caminhos de código, então mouse e
 * teclado não podem divergir.
 */

interface MethodGraphProps {
  /** t("methodTitle") — rótulo acessível do SVG (L1: copy do JSON). */
  ariaLabel: string;
  /** about.methodNodes — os 10 passos oficiais, na ordem do JSON. */
  labels: ReadonlyArray<string>;
}

export default function MethodGraph({ ariaLabel, labels }: MethodGraphProps) {
  const { active, activate } = useMethodFocus();

  return (
    <PulseCircle
      ariaLabel={ariaLabel}
      groups={groupMethodLabels(labels)}
      activeGroup={active}
      onActivate={activate}
      className={styles.diagram}
    />
  );
}
