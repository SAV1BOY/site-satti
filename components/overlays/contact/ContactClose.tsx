"use client";

import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * ContactClose — island mínima: botão fechar acessível do O2.
 * aria-label = contact.closeAriaLabel (copy do server); visual no
 * módulo do overlay (className vem do server — estilo fica lá).
 * Primeiro focável do painel → recebe o foco inicial do provider.
 */

interface ContactCloseProps {
  className: string;
  label: string;
}

export default function ContactClose({ className, label }: ContactCloseProps) {
  const { close } = useOverlay();

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      data-cursor="hover"
      onClick={close}
    >
      <span aria-hidden="true">✕</span>
    </button>
  );
}
