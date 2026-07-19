"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useOverlay } from "@/components/overlays/OverlayProvider";

/**
 * Islands do O3 (Idioma) — únicas partes client do overlay; todo o
 * layout/copy vem do server component (LanguageOverlay).
 *
 * - LanguageScrim: backdrop decorativo; clique fora fecha (equivalente
 *   de teclado = Esc, já provido pelo OverlayProvider).
 * - LanguageClose: botão fechar acessível (aria-label do JSON).
 * - LanguageOption: opção de idioma como <Link> de next/link (lint
 *   proíbe <a> para rotas) — fecha o overlay no clique e deixa a
 *   navegação client-side agir; idioma atual marcado com aria-current.
 */

export function LanguageScrim({ className }: { className: string }) {
  const { close } = useOverlay();
  return <div className={className} aria-hidden="true" onClick={close} />;
}

interface LanguageCloseProps {
  className: string;
  label: string;
  children: ReactNode;
}

export function LanguageClose({
  className,
  label,
  children,
}: LanguageCloseProps) {
  const { close } = useOverlay();
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={close}
    >
      {children}
    </button>
  );
}

interface LanguageOptionProps {
  href: string;
  hrefLang: string;
  current: boolean;
  className: string;
  children: ReactNode;
}

export function LanguageOption({
  href,
  hrefLang,
  current,
  className,
  children,
}: LanguageOptionProps) {
  const { close } = useOverlay();
  return (
    <Link
      href={href}
      hrefLang={hrefLang}
      className={className}
      aria-current={current ? "true" : undefined}
      onClick={close}
    >
      {children}
    </Link>
  );
}
