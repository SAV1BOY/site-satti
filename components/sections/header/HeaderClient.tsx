"use client";

import { useEffect, useState } from "react";
import { useOverlay } from "@/components/overlays/OverlayProvider";
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
}: HeaderClientProps) {
  const [active, setActive] = useState(false);
  // W4 (DEC-011): hambúrguer abre o O1 via OverlayProvider.
  const overlay = useOverlay();

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
        {/* Seletor de idioma → abre o O3 (DEC-011); os <Link> reais de
            troca vivem no overlay. */}
        <button
          type="button"
          className={styles.locale}
          aria-haspopup="dialog"
          aria-expanded={overlay.active === "language"}
          onClick={() => overlay.open("language")}
        >
          <span className={isPt ? styles.localeActive : styles.localeLink}>
            {localePt}
          </span>
          <span aria-hidden="true">{localeSeparator}</span>
          <span className={!isPt ? styles.localeActive : styles.localeLink}>
            {localeEn}
          </span>
        </button>

        {/* CTA → abre o O2 (DEC-011); sem JS degrada para a âncora do
            form canônico (#contato). */}
        <a
          className={styles.cta}
          href="#contato"
          data-cursor="hover"
          aria-haspopup="dialog"
          aria-expanded={overlay.active === "contact"}
          onClick={(e) => {
            e.preventDefault();
            overlay.open("contact");
          }}
        >
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
          aria-haspopup="dialog"
          aria-expanded={overlay.active === "menu"}
          onClick={() => overlay.open("menu")}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
