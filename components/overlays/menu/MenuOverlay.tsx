import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import MenuClose from "./MenuClose";
import MenuNavLink from "./MenuNavLink";
import MenuLanguage from "./MenuLanguage";
import styles from "./MenuOverlay.module.css";

/**
 * MenuOverlay (O1) — Server Component (L11), slot `menu` do
 * OverlayProvider (que provê dialog/aria-modal/foco/Esc/trap).
 * Comps: "O1 Menu Overlay Desktop 1920.dc.html" · "O1 Menu Mobile 375.dc.html".
 *
 * - Fullscreen graphite fixo (o wrapper do provider é neutro — o
 *   painel é este root).
 * - Nav numerada 01–06 = menu.items do JSON (D5, ordem canônica),
 *   âncoras #servicos/#sobre/#portfolio/#cases/#depoimentos/#contato.
 *   Item clicado fecha o overlay (island) e deixa o scroll nativo agir.
 * - Linha de Automação vertical DECORATIVA da comp: stroke line-dark,
 *   nodes hairline-dark (D1); pulso blaze via CSS transform (nada de
 *   SMIL — lei de tradução §4), some no reduced (L5). Quando o O1
 *   está aberto ele cobre a página inteira — o pulso do fio D3 fica
 *   oculto, então segue havendo UM pulso visível por viewport (L2).
 * - Rodapé: e-mail oficial (footer.contactEmail), GitHub oficial
 *   (footer.github/githubUrl — D6), LinkedIn/Instagram [CONFIRMAR]
 *   steel + data-confirm (L1; spans — sem URL confirmada não há
 *   link), localização (menu.location) e linha de idioma → island
 *   que abre O3 (DEC-011). Sem CTA de contato dedicado: a comp O1
 *   não tem um — "06 — Contato" navega para #contato.
 * - Copy 100% via next-intl (L1); tipografia var(--ff-*) (L12);
 *   alvos ≥44px; foco circuit (L3).
 */

/** Campo de copy L1: string oficial OU { value, confirm } ([CONFIRMAR] → steel). */
type CopyField =
  | string
  | { value: string; confirm?: boolean; draft?: string | null };

function readField(field: CopyField): { text: string; confirm: boolean } {
  if (typeof field === "string") return { text: field, confirm: false };
  return { text: field.value, confirm: field.confirm === true };
}

/** Alvos das âncoras da nav 01–06, na ordem canônica do menu.items (D5). */
const NAV_TARGETS = [
  "#servicos",
  "#sobre",
  "#portfolio",
  "#cases",
  "#depoimentos",
  "#contato",
] as const;

/** Posições dos nodes da linha vertical (comp desktop: 180/520/860 de 1000). */
const LINE_NODES = [180, 520, 860] as const;

export default async function MenuOverlay() {
  const t = await getTranslations("menu");
  const tFooter = await getTranslations("footer");
  const tLanguage = await getTranslations("language");

  const items = (t.raw("items") as string[]).slice(0, NAV_TARGETS.length);
  const linkedin = readField(t.raw("linkedin") as CopyField);
  const instagram = readField(t.raw("instagram") as CopyField);
  const github = readField(tFooter.raw("github") as CopyField);
  const contactEmail = tFooter("contactEmail");

  return (
    <div className={styles.root}>
      {/* Linha de Automação vertical decorativa (comp O1) */}
      <svg
        className={styles.line}
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
        role="img"
        aria-label={t("lineAriaLabel")}
      >
        <path className={styles.linePath} d="M20,0 L20,1000" />
        <g className={styles.pulse} aria-hidden="true">
          <circle className={styles.pulseHalo} cx="20" cy="0" r="9" />
          <circle className={styles.pulseDot} cx="20" cy="0" r="4" />
        </g>
        {LINE_NODES.map((y) => (
          <g key={y}>
            <circle className={styles.nodeOuter} cx="20" cy={y} r="7" />
            <circle className={styles.nodeInner} cx="20" cy={y} r="2.5" />
          </g>
        ))}
      </svg>

      {/* Topbar: wordmark + fechar */}
      <div className={styles.topbar}>
        <span className={styles.brand}>{t("brand")}</span>
        <MenuClose className={styles.close} label={t("closeAriaLabel")} />
      </div>

      {/* Navegação numerada 01–06 (D5) */}
      <nav className={styles.nav} aria-label={tFooter("navigationTitle")}>
        {items.map((item, i) => {
          // "01 — Serviços" → num "01" + label "Serviços" (só layout —
          // a string oficial permanece intacta, L1).
          const parts = item.split(" — ");
          const num =
            parts.length > 1 ? parts[0] : String(i + 1).padStart(2, "0");
          const label = parts.length > 1 ? parts.slice(1).join(" — ") : item;
          return (
            <MenuNavLink
              key={item}
              href={NAV_TARGETS[i]}
              className={styles.item}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className={styles.itemNum}>{num}</span>
              <span className={styles.itemLabel}>{label}</span>
            </MenuNavLink>
          );
        })}
      </nav>

      {/* Rodapé do overlay: e-mail · sociais · localização · idioma */}
      <div className={styles.meta}>
        <a className={styles.metaLink} href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
        <a
          className={styles.metaLink}
          href={tFooter("githubUrl")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {github.text}
        </a>
        {/* W6 modo final: sociais sem handle oficial são omitidos. */}
        {!(OMIT_UNCONFIRMED && linkedin.confirm) ? (
          <span
            className={styles.metaItem}
            data-confirm={linkedin.confirm ? "true" : undefined}
          >
            {linkedin.text}
          </span>
        ) : null}
        {!(OMIT_UNCONFIRMED && instagram.confirm) ? (
          <span
            className={styles.metaItem}
            data-confirm={instagram.confirm ? "true" : undefined}
          >
            {instagram.text}
          </span>
        ) : null}
        <span className={styles.metaItem}>{t("location")}</span>
        <MenuLanguage className={styles.language}>
          <span className={styles.srOnly}>{tLanguage("title")} — </span>
          {tLanguage("ptCode")} / {tLanguage("enCode")}
        </MenuLanguage>
      </div>
    </div>
  );
}
