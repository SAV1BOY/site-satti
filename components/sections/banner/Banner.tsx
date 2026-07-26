import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import styles from "./Banner.module.css";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";

/**
 * Banner (S8) — Server Component (L11).
 * Comps: "S8 Banner Desktop 1920.dc.html" · "S8 Banner Mobile 375.dc.html".
 *
 * - Full-viewport DARK (uma das 3 únicas seções 100vh — §4, lei de
 *   tradução comp→código): graphite via .section-dark, hairlines D1.
 * - Copy 100% via next-intl (L1): banner.copy é {value, confirm:true} →
 *   rótulo [CONFIRMAR] + rascunho banner.draftLines renderizado em
 *   steel com data-confirm="true" (modo draft; W6 final resolve).
 * - Texturas A8 (MANIFEST): 2 next/image com src DIRETO em
 *   /img/texture-{1,2}.webp (existem em disco — placeholders blueprint
 *   até o W5), inline no statement conforme a comp: textura 1 na linha
 *   "Número bom … não mente:", textura 2 após "crescimento".
 *   data-asset é SÓ para vídeo — S8 não tem slot de vídeo.
 * - L2: único blaze de destaque da dobra = CTA Button primary (texto
 *   iron sobre blaze); o marcador 8×8 do eyebrow não conta.
 * - Motion: NENHUM — a comp crava "Banner estático por desenho"
 *   (parallax leve das texturas é opcional na comp mobile e ficou
 *   fora). Logo não há client island: seção 100% server e L5 é
 *   satisfeita por construção (reduced = idêntico ao base).
 * - Sem AutomationLine: o fio D3 atravessa hero→serviços→automação→
 *   portfólio→contato; S8 não é zona do THREAD_PLAN.
 */

/** Campo com marcação [CONFIRMAR] do JSON (L1 — copy-law). */
interface ConfirmField {
  value: string;
  confirm?: boolean;
  draft?: string | null;
}

/** Paths definitivos das texturas A8 (MANIFEST — imagens estáticas). */
const TEXTURES = ["/img/texture-1.webp", "/img/texture-2.webp"] as const;

/** Largura real do chip (1.5em do statement): ~156px @1920 · ~60px @375. */
const TEXTURE_SIZES = "(max-width: 767px) 60px, 156px";

/** Chip de textura A8 inline no statement (decorativo — comp manda). */
function Texture({ index }: { index: 0 | 1 }) {
  return (
    <span className={styles.texture} aria-hidden="true">
      <Image
        src={resolveAsset(TEXTURES[index]).src}
        {...thirdPartyAttrs(TEXTURES[index])}
        alt=""
        fill
        sizes={TEXTURE_SIZES}
        className={styles.textureImg}
      />
    </span>
  );
}

export default async function Banner() {
  const t = await getTranslations("banner");

  const copy = t.raw("copy") as ConfirmField;
  const draftLines = t.raw("draftLines") as string[];
  const confirm = copy.confirm === true;

  // As POSIÇÕES das texturas são layout da comp (não copy): textura 1
  // entre as linhas 1–2 do rascunho; textura 2 após a linha 4. As
  // STRINGS vêm todas de banner.draftLines (L1 — nada hardcoded).
  const [lineA, lineB, lineC, lineD, lineE] = draftLines;

  return (
    <section className={`section-dark ${styles.section}`}
      data-section="banner"
      data-tone="dark"
    >
      <p className={`eyebrow ${styles.eyebrow}`}>{t("eyebrow")}</p>

      <div className={styles.statementBlock}>
        {/* W6 modo final: chrome de rascunho ([CONFIRMAR] + aviso) some;
            as linhas do rascunho permanecem em steel até a copy oficial
            (DEC-012 — nada de "[CONFIRMAR]" público). */}
        {confirm && !OMIT_UNCONFIRMED ? (
          <p className={styles.confirmTag} data-confirm="true">
            {copy.value}
          </p>
        ) : null}

        <h2
          className={styles.statement}
          data-confirm={confirm ? "true" : undefined}
        >
          <span className={styles.row}>
            <span>{lineA}</span>
            <Texture index={0} />
            <span>{lineB}</span>
          </span>
          <span className={styles.line}>{lineC}</span>
          <span className={styles.row}>
            <span>{lineD}</span>
            <Texture index={1} />
          </span>
          <span className={styles.line}>{lineE}</span>
        </h2>

        {confirm && !OMIT_UNCONFIRMED ? (
          <p className={styles.draftNotice}>{t("draftNotice")}</p>
        ) : null}
      </div>

      <div className={styles.ctaRow}>
        <Button variant="primary" href="#contato" className={styles.cta}>
          {t("cta")}
        </Button>
      </div>
    </section>
  );
}
