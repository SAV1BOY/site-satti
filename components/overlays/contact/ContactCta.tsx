"use client";

import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * ContactCta — island mínima: CTA principal do O2.
 * Âncora nativa para o form canônico (#contato, S11) que fecha o
 * overlay no clique — o close() desmonta o dialog e deixa o scroll
 * nativo da âncora agir (padrão navegar-e-fechar do W4). Âncora de
 * hash usa <a> puro (o lint só proíbe <a> para ROTAS — precedente
 * do HeaderClient/Hero).
 */

interface ContactCtaProps {
  className: string;
  href: string;
  label: string;
}

export default function ContactCta({ className, href, label }: ContactCtaProps) {
  const { close } = useOverlay();

  return (
    <a
      className={className}
      href={href}
      data-cursor="hover"
      onClick={() => close()}
    >
      {label}
    </a>
  );
}
