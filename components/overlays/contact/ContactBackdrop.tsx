"use client";

import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * ContactBackdrop — island mínima: scrim blur/tinta do O2 (desktop).
 * Clique fora do painel fecha (atalho de ponteiro; os caminhos
 * acessíveis são Esc — no provider — e o botão fechar). aria-hidden:
 * é puramente decorativo, nunca entra na árvore de acessibilidade.
 */

interface ContactBackdropProps {
  className: string;
}

export default function ContactBackdrop({ className }: ContactBackdropProps) {
  const { close } = useOverlay();

  return <div className={className} aria-hidden="true" onClick={close} />;
}
