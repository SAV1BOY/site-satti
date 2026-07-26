"use client";

import styles from "./Footer.module.css";
import { useScrollTimeline } from "@/hooks/useScrollTimeline";

/**
 * FooterHat — wordmark gigante decorativo com parallax sutil
 * (Atlas: "footer parallax hat").
 *
 * Client island mínima (L11): o Footer é Server Component; aqui mora
 * SÓ o efeito. Parallax transform-only (L10), mapeamento linear do
 * progresso de scroll (sem tween; o easing é o do próprio dedo/roda).
 *
 * W11-F: o rAF próprio saiu — o efeito virou um track do loop
 * compartilhado (useScrollTimeline). Mesma matemática e mesmo
 * arredondamento de antes; o que muda é que a leitura de rect entra na
 * fase de READ global (um flush de layout por frame na página) e o
 * loop estaciona quando nada está em view.
 *
 * L5: o ScrollProvider não monta o loop sob
 * (prefers-reduced-motion: reduce) → o hat fica estático no estado das
 * comps, sem transform inline. E é o provider que devolve o
 * `transform`/`will-change` do elemento inscrito no teardown, então não
 * há limpeza manual a fazer aqui.
 *
 * A11y: puramente decorativo — wrapper aria-hidden (a marca legível é
 * a da coluna do footer).
 */

/** Curso do parallax em % da própria altura do hat (sutil). */
const HAT_FROM = 12;
const HAT_TO = -6;

interface FooterHatProps {
  /** Wordmark (footer.brand via next-intl no pai — copy nunca hardcoded, L1). */
  text: string;
}

export default function FooterHat({ text }: FooterHatProps) {
  /* Inscreve o INNER (é ele que recebe o transform e é ele que o
     provider limpa no teardown), mas mede o rect do WRAPPER: medir o
     próprio inner realimentaria o transform que acabamos de escrever. */
  const attachInner = useScrollTimeline<number>({
    read: (el, { vh }) => {
      const host = el.parentElement;
      if (!host) return Number.NaN;
      const rect = host.getBoundingClientRect();
      // 0 → topo do hat entrando pela base da viewport · 1 → base saindo
      // pelo topo (o footer é a última dobra: fica num trecho parcial).
      const progress = Math.min(
        1,
        Math.max(0, (vh - rect.top) / (vh + rect.height)),
      );
      return Math.round((HAT_FROM + (HAT_TO - HAT_FROM) * progress) * 100) / 100;
    },
    write: (el, y) => {
      if (Number.isNaN(y)) return;
      (el as HTMLElement).style.transform = `translate3d(0, ${y}%, 0)`;
    },
    promote: true,
  });

  return (
    <div className={styles.hat} aria-hidden="true">
      <span ref={attachInner} className={styles.hatInner}>
        {text}
      </span>
    </div>
  );
}
