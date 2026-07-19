"use client";

import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * MenuClose — island mínima do O1: botão circular ✕ que fecha o
 * overlay via useOverlay().close(). Label acessível vem do JSON
 * (menu.closeAriaLabel — L1); o glyph é decorativo (aria-hidden).
 * O foco volta ao trigger (hambúrguer) pelo chrome do provider.
 */

interface MenuCloseProps {
  className: string;
  label: string;
}

export default function MenuClose({ className, label }: MenuCloseProps) {
  const { close } = useOverlay();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => close()}
    >
      <span aria-hidden="true">✕</span>
    </button>
  );
}
