import { getLocale, getTranslations } from "next-intl/server";
import styles from "./LanguageOverlay.module.css";
import {
  LanguageClose,
  LanguageOption,
  LanguageScrim,
} from "./LanguageIslands";

/**
 * LanguageOverlay (O3 · Idioma) — dropdown de troca PT → EN.
 * Fonte visual: "O3 Idioma Overlay Desktop 1920.dc.html" + Mobile 375.
 *
 * SERVER component: copy 100% de language.* (getTranslations) e idioma
 * atual via getLocale — o item ativo ganha aria-current + pele circuit
 * (L3: uso funcional, estado selecionado; zero blaze neste viewport,
 * conforme a nota de Blaze da própria comp).
 *
 * Composição (contrato do OverlayProvider): este componente é o CONTEÚDO
 * do role="dialog" — raiz fixed fullscreen com scrim + card ancorado sob
 * o seletor do header (desktop top-right 104/31 · mobile central 84/16,
 * derivados do StickyHeader real 20+66 / 12+56). O header mock e as
 * backdropLines da comp são andaime de preview (§4, lei comp→código):
 * atrás do scrim real fica a própria página.
 *
 * Interações (islands): fechar (botão + clique no scrim) e navegar-e-
 * -fechar (opções <Link> de next/link — "/" pt-BR · "/en" en).
 */

interface LanguageOptionSpec {
  href: string;
  hrefLang: string;
  code: string;
  label: string;
  active: boolean;
}

export default async function LanguageOverlay() {
  const locale = await getLocale();
  const t = await getTranslations("language");
  const isPt = locale !== "en";

  const options: LanguageOptionSpec[] = [
    {
      href: "/",
      hrefLang: "pt-BR",
      code: t("ptCode"),
      label: t("ptLabel"),
      active: isPt,
    },
    {
      href: "/en",
      hrefLang: "en",
      code: t("enCode"),
      label: t("enLabel"),
      active: !isPt,
    },
  ];

  return (
    <div className={styles.root}>
      <LanguageScrim className={styles.scrim} />

      <div className={styles.panel}>
        <div className={styles.head}>
          <h2 className={styles.title}>{t("title")}</h2>
          <LanguageClose className={styles.close} label={t("closeAriaLabel")}>
            <span aria-hidden="true">✕</span>
          </LanguageClose>
        </div>

        {options.map((option) => (
          <LanguageOption
            key={option.hrefLang}
            href={option.href}
            hrefLang={option.hrefLang}
            current={option.active}
            className={
              option.active
                ? `${styles.option} ${styles.optionActive}`
                : styles.option
            }
          >
            <span className={styles.optionMain}>
              <span className={styles.code}>{option.code}</span>
              <span className={styles.label}>{option.label}</span>
            </span>
            <span
              className={option.active ? styles.check : styles.arrow}
              aria-hidden="true"
            >
              {option.active ? "✓" : "→"}
            </span>
          </LanguageOption>
        ))}

        <p className={styles.note}>{t("enRoute")}</p>
      </div>
    </div>
  );
}
