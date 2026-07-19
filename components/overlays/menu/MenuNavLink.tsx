"use client";

import type { CSSProperties, ReactNode } from "react";
import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * MenuNavLink — island mínima do O1: âncora interna (#servicos…)
 * que fecha o overlay no clique e DEIXA a navegação nativa agir
 * (sem preventDefault — o scroll até a seção é o default do <a>).
 * Âncora de fragmento na MESMA rota → <a> nativo (a regra de lint
 * de <Link> vale para rotas/locales, não para fragmentos).
 */

interface MenuNavLinkProps {
  href: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function MenuNavLink({
  href,
  className,
  style,
  children,
}: MenuNavLinkProps) {
  const { close } = useOverlay();
  return (
    <a
      href={href}
      className={className}
      style={style}
      data-cursor="hover"
      onClick={() => close()}
    >
      {children}
    </a>
  );
}
