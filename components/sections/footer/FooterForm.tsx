"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import { submitBrief, type SubmitBriefState } from "@/app/actions/submit-brief";
import styles from "./Footer.module.css";

/**
 * FooterForm — island do form D6 ligada à Server Action submitBrief (W4).
 *
 * Estados (React 19 useActionState):
 * - "invalid": .isError POR CAMPO reprovado (borda --c-error só onde
 *   falhou) — espelha o retorno fieldErrors da action;
 * - "error": envio falhou/canais indisponíveis → .hasSubmitError no form
 *   (mostra a mensagem OFICIAL footer.form.error, sem avermelhar campos);
 * - "success": .isSuccess no form (bordas --c-success + ✓ + mensagem).
 * Honeypot: input "website" visualmente oculto (bots preenchem; a action
 * finge sucesso). Enquanto isPending, o submit desabilita.
 * Copy 100% via props do Server Component pai (L1 — nada hardcoded).
 */

interface FooterFormProps {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  companyLabel: string;
  companyPlaceholder?: string;
  budgetLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  errorMessage: string;
  successMessage: string;
}

const INITIAL_STATE: SubmitBriefState = { status: "idle" };

export default function FooterForm({
  nameLabel,
  namePlaceholder,
  emailLabel,
  companyLabel,
  companyPlaceholder,
  budgetLabel,
  messageLabel,
  messagePlaceholder,
  submitLabel,
  errorMessage,
  successMessage,
}: FooterFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitBrief,
    INITIAL_STATE,
  );

  const formClass = [
    styles.form,
    state.status === "error" ? styles.hasSubmitError : null,
    state.status === "success" ? styles.isSuccess : null,
  ]
    .filter(Boolean)
    .join(" ");

  const fieldClass = (field: "name" | "email" | "message") =>
    state.status === "invalid" && state.fieldErrors?.[field] !== undefined
      ? `${styles.field} ${styles.isError}`
      : styles.field;

  return (
    <form className={formClass} action={formAction} noValidate={false}>
      <div className={styles.fieldGrid}>
        <div className={fieldClass("name")}>
          <label className={styles.label} htmlFor="footer-name">
            {nameLabel}
          </label>
          <div className={styles.control}>
            <input
              className={styles.input}
              id="footer-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={namePlaceholder}
              required
            />
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
          </div>
        </div>

        <div className={fieldClass("email")}>
          <label className={styles.label} htmlFor="footer-email">
            {emailLabel}
          </label>
          <div className={styles.control}>
            <input
              className={styles.input}
              id="footer-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
          </div>
        </div>

        {/* Empresa — OPCIONAL (D6): sem required. */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="footer-company">
            {companyLabel}
          </label>
          <div className={styles.control}>
            <input
              className={styles.input}
              id="footer-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={companyPlaceholder}
            />
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
          </div>
        </div>

        {/* Faixa de investimento — OPCIONAL (D6). */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="footer-budget">
            {budgetLabel}
          </label>
          <div className={styles.control}>
            <input
              className={styles.input}
              id="footer-budget"
              name="budget"
              type="text"
              autoComplete="off"
            />
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
          </div>
        </div>

        <div className={`${fieldClass("message")} ${styles.fieldWide}`}>
          <label className={styles.label} htmlFor="footer-message">
            {messageLabel}
          </label>
          <div className={styles.control}>
            <textarea
              className={styles.textarea}
              id="footer-message"
              name="message"
              rows={5}
              placeholder={messagePlaceholder}
              required
            />
            <span className={styles.check} aria-hidden="true">
              ✓
            </span>
          </div>
        </div>
      </div>

      {/* Honeypot — invisível para humanos, irresistível para bots. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="footer-website">website</label>
        <input
          id="footer-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Feedback D6 — só texto+borda+ícone; copy oficial do JSON. */}
      <p className={styles.formError} role="status">
        <span aria-hidden="true">⚠</span>
        {errorMessage}
      </p>
      <p className={styles.formSuccess} role="status">
        <span aria-hidden="true">✓</span>
        {successMessage}
      </p>

      <Button type="submit" className={styles.submit} disabled={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
