import { getLocale, getTranslations } from "next-intl/server";
import HeaderClient from "./HeaderClient";

/**
 * StickyHeader — pill fixo do topo (comp S1+S2, estado base).
 * Server wrapper: resolve copy (header.*) e locale; o comportamento
 * (estado ativo aos ~80% do hero, menu O1 no W4) vive no HeaderClient.
 */

/** Âncoras na ordem de header.nav (Serviços · Sobre · Portfólio · Contato). */
const NAV_ANCHORS = ["#servicos", "#sobre", "#portfolio", "#contato"] as const;

export default async function StickyHeader() {
  const t = await getTranslations("header");
  const locale = await getLocale();
  const nav = (t.raw("nav") as string[]).map((label, i) => ({
    label,
    href: NAV_ANCHORS[i] ?? "#",
  }));

  return (
    <HeaderClient
      brand={t("brand")}
      nav={nav}
      cta={t("cta")}
      menuLabel={t("menuAriaLabel")}
      localePt={t("localePt")}
      localeSeparator={t("localeSeparator")}
      localeEn={t("localeEn")}
      currentLocale={locale}
    />
  );
}
