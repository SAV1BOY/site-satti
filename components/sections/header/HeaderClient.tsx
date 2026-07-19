"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./StickyHeader.module.css";

/**
 * HeaderClient — comportamento do pill (comp S1+S2 + decisão F0-F5):
 * - Estado base (sobre o hero): CTA "Falar com a SATTI" ghost/hairline.
 * - Aos ~80% da altura da viewport (fim do hero) o header ativa e o CTA
 *   preenche blaze — transição .4s var(--ease), texto iron sobre blaze (L2).
 * - Scroll: listener passive + rAF-throttle (padrão sancionado pela L10).
 * - CTA com roll de texto (duas camadas, --ease-roll — comp: 0.35s).
 * - Menu hambúrguer: abre O1 no W4; por ora aria-expanded=false + handler.
 * - Reduced-motion: sem transição de preenchimento nem roll (só troca).
 */

interface NavItem {
  label: string;
  href: string;
}

interface HeaderClientProps {
  brand: string;
  nav: NavItem[];
  cta: string;
  menuLabel: string;
  localePt: string;
  localeSeparator: string;
  localeEn: string;
  currentLocale: string;
  onMenuOpen?: () => void;
}

export default function HeaderClient({
  brand,
  nav,
  cta,
  menuLabel,
  localePt,
  localeSeparator,
  localeEn,
  currentLocale,
  onMenuOpen,
}: HeaderClientProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      setActive(window.scrollY >= window.innerHeight * 0.8);
      raf = 0;
    };
    const onScroll = () => {
      if (raf === 0) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const isPt = currentLocale !== "en";

  return (
    <header className={styles.header} data-active={active ? "true" : "false"}>
      <a className={styles.brand} href="#top">
        {brand}
      </a>

      <nav className={styles.nav}>
        {nav.map((item) => (
          <a key={item.href} className={styles.navLink} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className={styles.actions}>
        <span className={styles.locale}>
          <Link
            href="/"
            className={isPt ? styles.localeActive : styles.localeLink}
            aria-current={isPt ? "true" : undefined}
          >
            {localePt}
          </Link>
          <span aria-hidden="true">{localeSeparator}</span>
          <Link
            href="/en"
            className={!isPt ? styles.localeActive : styles.localeLink}
            aria-current={!isPt ? "true" : undefined}
          >
            {localeEn}
          </Link>
        </span>

        <a className={styles.cta} href="#contato" data-cursor="hover">
          <span className={styles.ctaMask}>
            <span className={styles.ctaLabel}>{cta}</span>
            <span className={styles.ctaLabel} aria-hidden="true">
              {cta}
            </span>
          </span>
        </a>

        <button
          className={styles.menu}
          type="button"
          aria-label={menuLabel}
          aria-expanded={false}
          onClick={() => onMenuOpen?.()}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
