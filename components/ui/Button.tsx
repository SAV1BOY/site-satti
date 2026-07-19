import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "dark-ghost";

interface ButtonBaseProps {
  /**
   * primary — fundo blaze, texto iron (L2: nunca branco sobre blaze).
   * secondary — ghost com hairline var(--c-line) sobre paper.
   * dark-ghost — ghost para seções graphite (hairline-dark + ink-on-dark).
   */
  variant?: ButtonVariant;
  /** Círculo com seta → que rola junto com o texto no hover. */
  arrow?: boolean;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

interface ButtonAsLinkProps extends ButtonBaseProps {
  /** Com href renderiza <Link> (rota interna/#âncora) ou <a> (externo). */
  href: string;
  target?: "_blank" | "_self";
  rel?: string;
  onClick?: never;
  type?: never;
  disabled?: never;
}

interface ButtonAsButtonProps extends ButtonBaseProps {
  href?: never;
  target?: never;
  rel?: never;
  /** Só tem efeito quando o Button é consumido dentro de uma boundary "use client". */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  "dark-ghost": styles.darkGhost,
};

/**
 * Botão pill "roll" do SATTI DS (folha 03 — Botões).
 * Server Component: o roll é 100% CSS (hover/focus), sem estado.
 * O texto é duplicado em duas camadas dentro de uma máscara; no hover a
 * camada de cima sobe (translateY(-100%)) e a de baixo entra — 450ms
 * var(--ease-roll). Em reduced-motion não há roll (L5): hover estático
 * translateY(-1px). Alvo ≥ 44px de altura (60px reais).
 */
export default function Button(props: ButtonProps) {
  const { variant = "primary", arrow = false, children, className } = props;
  const cls = [styles.root, VARIANT_CLASS[variant], className]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className={styles.mask}>
        <span className={styles.label}>{children}</span>
        <span className={styles.label} aria-hidden="true">
          {children}
        </span>
      </span>
      {arrow ? (
        <span className={styles.circle} aria-hidden="true">
          <span className={`${styles.arrowIcon} ${styles.arrowA}`}>→</span>
          <span className={`${styles.arrowIcon} ${styles.arrowB}`}>→</span>
        </span>
      ) : null}
    </>
  );

  if (props.href !== undefined) {
    const { href, target, rel } = props;
    const isInternal = href.startsWith("/") || href.startsWith("#");

    if (isInternal) {
      return (
        <Link
          href={href}
          className={cls}
          data-cursor="hover"
          aria-label={props["aria-label"]}
        >
          {inner}
        </Link>
      );
    }

    const safeRel = target === "_blank" ? (rel ?? "noopener noreferrer") : rel;
    return (
      <a
        href={href}
        target={target}
        rel={safeRel}
        className={cls}
        data-cursor="hover"
        aria-label={props["aria-label"]}
      >
        {inner}
      </a>
    );
  }

  const { onClick, type = "button", disabled } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      data-cursor="hover"
      aria-label={props["aria-label"]}
    >
      {inner}
    </button>
  );
}
