import { getTranslations } from "next-intl/server";
import AutomationLine from "@/components/ui/AutomationLine";
import FooterForm from "./FooterForm";
import FooterHat from "./FooterHat";
import styles from "./Footer.module.css";

/**
 * Footer/Contato (S11) — Server Component (L11).
 * Comps: "S11 Footer Desktop 1920.dc.html" · "S11 Footer Mobile 375.dc.html".
 *
 * - Seção DARK full-viewport (§4 lei de tradução: S11 é uma das 3 seções
 *   100vh). Graphite + hairlines D1: --c-line-dark separadores,
 *   --c-hairline-dark bordas de input/célula. Zero hex literal.
 * - FIM da Linha de Automação (D3): <AutomationLine zone="contact"
 *   tone="dark" /> como PRIMEIRO filho da section relative — o fio
 *   TERMINA aqui (waypoint "end" do THREAD_PLAN). Sem nodeLabels:
 *   os nodes da comp S11 não têm strings (L1).
 * - D6: form nativo com 5 campos — nome, e-mail, empresa (OPCIONAL),
 *   mensagem, faixa de investimento (OPCIONAL) — e os 4 estados de
 *   input do DS via CSS: default hairline-dark → focus ring circuit
 *   (:focus-visible, L3) → erro --c-error → sucesso --c-success.
 *   Feedback SÓ texto+borda+ícone. O form vive na island FooterForm
 *   (W4): useActionState + submitBrief (honeypot, rate-limit, Zod,
 *   Resend, n8n; env ausente degrada). Mensagem de erro = a oficial
 *   footer.form.error (L1).
 * - L2 · blaze da dobra = botão Enviar (Button primary, texto iron);
 *   o pulso da Linha conta na dobra em que estiver (D3). O marcador
 *   8×8 do eyebrow não conta.
 * - Copy 100% via next-intl (L1). LinkedIn/Instagram são {value,
 *   confirm:true} → steel + data-confirm (modo draft; W6 final omite).
 *   GitHub oficial (D6) via footer.github/githubUrl do JSON.
 * - E-mail: mailto com footer.contactEmail (nunca hardcoded).
 * - Copyright dinâmico: footer.copyright.value com {year} →
 *   new Date().getFullYear() (D6 resolve o [CONFIRMAR ano] da comp).
 * - Parallax hat (Atlas: "footer parallax hat"): FooterHat, client
 *   island mínima — wordmark gigante decorativo, translateY sutil no
 *   scroll via IO+rAF, transform-only (L10), gated por useMotionOk
 *   (L5; reduced/SSR = estático como nas comps).
 * - Landmark: <footer> com <div>s internos (NUNCA <main> aqui — o
 *   main da página é um só). Alvos interativos ≥ 44px.
 */

/** Campo de copy L1: string oficial OU { value, confirm } ([CONFIRMAR] → steel). */
type CopyField =
  | string
  | { value: string; confirm?: boolean; draft?: string | null };

function readField(field: CopyField): { text: string; confirm: boolean } {
  if (typeof field === "string") return { text: field, confirm: false };
  return { text: field.value, confirm: field.confirm === true };
}

/** Placeholder opcional do JSON (PT: companyPlaceholder = null). */
function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Alvos das âncoras de footer.navigation, na ordem do JSON (D5).
 * "Início" não tem seção própria → "#top" (fragmento especial do HTML:
 * sem elemento #top na página, o browser rola ao topo do documento).
 */
const NAV_TARGETS = [
  "#top",
  "#servicos",
  "#sobre",
  "#automacao",
  "#portfolio",
  "#contato",
] as const;

export default async function Footer() {
  const t = await getTranslations("footer");

  const titleLines = t.raw("titleLines") as string[];
  const navigation = (t.raw("navigation") as string[]).slice(
    0,
    NAV_TARGETS.length,
  );
  const github = readField(t.raw("github") as CopyField);
  const linkedin = readField(t.raw("linkedin") as CopyField);
  const instagram = readField(t.raw("instagram") as CopyField);
  const contactEmail = t("contactEmail");
  const companyPlaceholder = optionalText(t.raw("form.companyPlaceholder"));
  const copyright = t("copyright.value", {
    year: String(new Date().getFullYear()),
  });

  return (
    <footer id="contato" className={styles.root}>
      {/* D3: fim do fio — primeiro filho da section relative. */}
      <AutomationLine zone="contact" tone="dark" />

      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.sectionEyebrow}`}>
          {t("sectionLabel")}
        </p>

        <div className={styles.grid}>
          {/* --- Coluna esquerda: título + form D6 --------------------- */}
          <div className={styles.formCol}>
            <h2 className={styles.title}>
              {titleLines.map((line) => (
                <span key={line} className={styles.titleLine}>
                  {line}
                </span>
              ))}
            </h2>

            {/* Form D6 ligado à Server Action submitBrief (W4) — island
                client; copy 100% via props (L1). */}
            <FooterForm
              nameLabel={t("form.nameLabel")}
              namePlaceholder={t("form.namePlaceholder")}
              emailLabel={t("form.emailLabel")}
              companyLabel={t("form.companyLabel")}
              companyPlaceholder={companyPlaceholder}
              budgetLabel={t("form.budgetLabel")}
              messageLabel={t("form.messageLabel")}
              messagePlaceholder={t("form.messagePlaceholder")}
              submitLabel={t("form.submit")}
              errorMessage={t("form.error.value")}
              successMessage={t("form.success")}
            />
          </div>

          {/* --- Coluna direita: marca, e-mail, nav, sociais, meta ----- */}
          <div className={styles.sideCol}>
            <p className={styles.brand}>{t("brand")}</p>

            <a className={styles.email} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>

            <div className={styles.linkCols}>
              <nav
                className={styles.linkCol}
                aria-label={t("navigationTitle")}
              >
                <span className={styles.colTitle}>{t("navigationTitle")}</span>
                <div className={styles.navList}>
                  {navigation.map((label, i) => (
                    <a
                      key={label}
                      className={styles.navLink}
                      href={NAV_TARGETS[i]}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </nav>

              <div className={`${styles.linkCol} ${styles.socialCol}`}>
                <span className={styles.colTitle}>{t("socialTitle")}</span>
                {/* GitHub oficial (D6) — único social confirmado da v1 */}
                <a
                  className={styles.social}
                  href={t("githubUrl")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {github.text}
                </a>
                <span
                  className={styles.social}
                  data-confirm={linkedin.confirm ? "true" : undefined}
                >
                  {linkedin.text}
                </span>
                <span
                  className={styles.social}
                  data-confirm={instagram.confirm ? "true" : undefined}
                >
                  {instagram.text}
                </span>
              </div>
            </div>

            <div className={styles.sideMeta}>
              <span>{t("descriptor")}</span>
              <span>{t("location")}</span>
            </div>
          </div>
        </div>

        {/* Parallax hat (decorativo — a marca acessível é a da coluna). */}
        <FooterHat text={t("brand")} />

        <div className={styles.meta}>
          <span className={styles.metaItem}>{copyright}</span>
          <span className={styles.metaItem}>{t("signature")}</span>
        </div>
      </div>
    </footer>
  );
}
