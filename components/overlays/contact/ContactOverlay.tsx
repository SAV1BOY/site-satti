import { getTranslations } from "next-intl/server";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import ContactBackdrop from "./ContactBackdrop";
import ContactClose from "./ContactClose";
import ContactCta from "./ContactCta";
import styles from "./ContactOverlay.module.css";

/**
 * O2 · Contato — Server Component (L11), slot `contact` do
 * OverlayProvider (o wrapper já provê dialog/aria-modal/foco/Esc/
 * trap/data-lenis-prevent — aqui é só o conteúdo).
 * Comps: "O2 Contato Overlay Desktop 1920.dc.html" · "O2 Contato
 * Mobile 375.dc.html". Desktop = painel lateral direito 620px com
 * backdrop blur; mobile = TELA CHEIA (decisão §4 travada).
 *
 * - Form: o canônico com Server Action vive no S11 Footer (#contato).
 *   A comp do O2 mostra os 4 estados do DS como vitrine ESTÁTICA —
 *   traduzida como bloco decorativo aria-hidden (a comp usa <div>s,
 *   não <input>s); nada de form duplicado. O CTA "Enviar" (blaze,
 *   único destaque L2) ancora para #contato fechando o overlay.
 * - Copy 100% de contact.* (L1): [CONFIRMAR] → steel + data-confirm
 *   (erro e handles sociais). As legendas-anotação da comp ("Focus ·
 *   ring circuit" / sufixo "· success") são scaffolding de revisão
 *   (§4 lei de tradução) — descartadas; a legenda do estado sucesso
 *   usa o literal do JSON contact.success ("Sucesso").
 * - O mock atrás da comp ("Construímos máquinas de vender" borrado)
 *   é maquete do conteúdo real → backdrop-filter sobre a página viva
 *   (contact.backdropLines não renderiza).
 */

/** Campo com marcação [CONFIRMAR] do JSON (L1 — copy-law). */
interface ConfirmField {
  value: string;
  confirm?: boolean;
  draft?: string | null;
}

/** Âncora do form canônico (S11 Footer — id="contato"). */
const CONTACT_ANCHOR = "#contato";

export default async function ContactOverlay() {
  const t = await getTranslations("contact");

  const error = t.raw("error") as ConfirmField;
  const linkedin = t.raw("linkedin") as ConfirmField;
  const instagram = t.raw("instagram") as ConfirmField;

  return (
    <div className={styles.root}>
      <ContactBackdrop className={styles.backdrop} />

      <div className={styles.panel}>
        <div className={styles.top}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <ContactClose
            className={styles.close}
            label={t("closeAriaLabel")}
          />
        </div>

        <h2 className={styles.title}>{t("title")}</h2>

        {/* Vitrine dos 4 estados de input do DS (comp) — decorativa:
            divs estáticas como na comp, fora da árvore de a11y. */}
        <div className={styles.fields} aria-hidden="true">
          {/* Nome · default */}
          <div className={styles.field}>
            <span className={styles.label}>{t("nameLabel")}</span>
            <span className={styles.input}>
              <span className={styles.placeholder}>
                {t("namePlaceholder")}
              </span>
            </span>
          </div>

          {/* E-mail · focus (ring circuit do DS) */}
          <div className={styles.field}>
            <span className={styles.label}>{t("emailLabel")}</span>
            <span className={`${styles.input} ${styles.inputFocus}`}>
              <span className={styles.value}>{t("emailExample")}</span>
              <span className={styles.caret} />
            </span>
          </div>

          {/* Mensagem · erro (texto [CONFIRMAR] em steel — L1) */}
          <div className={styles.field}>
            <span className={styles.label}>{t("messageLabel")}</span>
            <span className={`${styles.input} ${styles.inputError}`}>
              <span className={styles.value}>{t("messagePlaceholder")}</span>
            </span>
            <span className={styles.errorNote}>
              <span>⚠</span>
              <span
                className={styles.confirmText}
                data-confirm={error.confirm ? "true" : undefined}
              >
                {error.value}
              </span>
            </span>
          </div>

          {/* E-mail de retorno · sucesso */}
          <div className={styles.field}>
            <span className={styles.label}>{t("returnEmailLabel")}</span>
            <span className={`${styles.input} ${styles.inputSuccess}`}>
              <span className={styles.value}>{t("returnEmailExample")}</span>
              <span className={styles.check}>✓</span>
            </span>
            <span className={styles.stateNote}>{t("success")}</span>
          </div>
        </div>

        <ContactCta
          className={styles.cta}
          href={CONTACT_ANCHOR}
          label={t("submit")}
        />

        {/* Handles [CONFIRMAR] → steel, sem href (nada a navegar).
            W6 modo final: sem handle oficial, o bloco some. */}
        {!(OMIT_UNCONFIRMED && linkedin.confirm && instagram.confirm) ? (
          <div className={styles.socials}>
            {!(OMIT_UNCONFIRMED && linkedin.confirm) ? (
              <span
                className={styles.social}
                data-confirm={linkedin.confirm ? "true" : undefined}
              >
                {linkedin.value}
              </span>
            ) : null}
            {!(OMIT_UNCONFIRMED && instagram.confirm) ? (
              <span
                className={styles.social}
                data-confirm={instagram.confirm ? "true" : undefined}
              >
                {instagram.value}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
