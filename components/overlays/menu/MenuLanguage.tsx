"use client";

import type { ReactNode } from "react";
import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * MenuLanguage — island mínima do O1: linha de idioma que abre o
 * O3 via useOverlay().open("language") (DEC-011). O conteúdo
 * visível (PT / EN + label sr-only "Idioma") vem do server via
 * children — copy 100% do JSON (language.*, L1).
 */

interface MenuLanguageProps {
  className: string;
  children: ReactNode;
}

export default function MenuLanguage({
  className,
  children,
}: MenuLanguageProps) {
  const { open } = useOverlay();
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-expanded={false}
      onClick={() => open("language")}
    >
      {children}
    </button>
  );
}
