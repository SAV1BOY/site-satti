import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Button from "@/components/ui/Button";
import Marquee from "@/components/ui/Marquee";
import { OMIT_UNCONFIRMED } from "@/lib/content-mode";
import styles from "./Banner.module.css";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";

/**
 * Banner (S8) — painel-display. Server Component (L11).
 *
 * ── Reversão consciente: volta a ser CLARO (DEC-018a) ───────────────────────
 * O v1 pôs a seção em graphite e registrou como "divergência intencional". O
 * modelo usa um painel **claro** com raio 130px, e o `parity:dom` acusava
 * "4 seções escuras contra 3 do modelo" exatamente por causa disto. Agora:
 * `data-tone="light"`, sem `.section-dark`, painel em paper sobre a moldura
 * `--tint-slate` da seção (o contraste que torna o raio de 130px legível —
 * dois paper empilhados apagariam a assinatura da seção).
 *
 * ── Geometria (awsmd-geometry.json → `banner`) ──────────────────────────────
 * section 100vh / max 750px / padding-block 20 · container max-height 710 ·
 * display radius 130 + overflow hidden · título 500 87px/1.1, ls −0.02em,
 * centralizado em coluna · marquee decorativo atrás (zIndex 1).
 *
 * ── As texturas são PALAVRAS VISUAIS no fluxo do texto ──────────────────────
 * Não são chips ao lado da linha: são `<img>` inline com `width: 2.46875em`,
 * `border-radius: .4583em` e `vertical-align: middle`, dimensionadas em `em` do
 * próprio título — encolhem com ele. Por isso as linhas do statement são blocos
 * de texto normal (não flex): flex quebraria o fluxo inline que faz a textura
 * se comportar como palavra.
 *
 * ── Copy (L1 · DEC-012) ────────────────────────────────────────────────────
 * `banner.copy` é `{value, confirm:true}` → rótulo [CONFIRMAR] + rascunho
 * `banner.draftLines` em steel via `data-confirm`. Em modo final o chrome de
 * rascunho some e as linhas PERMANECEM em steel até a copy oficial. Só a pele
 * mudou nesta wave; este comportamento é preservado byte a byte.
 *
 * ── Movimento ──────────────────────────────────────────────────────────────
 * Nenhum na camada de conteúdo. O único movimento é o marquee decorativo de
 * caixas vazias atrás do texto (raiz `aria-hidden`, 20s, sentido `right`), e
 * ele já é gated por `no-preference` dentro do Marquee (L5/L10).
 */

/** Campo com marcação [CONFIRMAR] do JSON (L1 — copy-law). */
interface ConfirmField {
  value: string;
  confirm?: boolean;
  draft?: string | null;
}

/** Paths definitivos das texturas A8 (MANIFEST — imagens estáticas). */
const TEXTURES = ["/img/texture-1.webp", "/img/texture-2.webp"] as const;

/** Arquivo real (MANIFEST): 476×180 para um render de 215×81. */
const TEXTURE_FILE = { width: 476, height: 180 } as const;

/** Render: 2.46875em do título → ~215px @1920, ~100px @375. */
const TEXTURE_SIZES = "(max-width: 767px) 100px, 215px";

/** Caixas contornadas do marquee decorativo (185×307 + 21 de margem = 206px).
 *  7 caixas × repeat 2 = 14 por lane = 2.884px: cobre viewports até 2.884px
 *  sem vão e roda a 144 px/s em 20s — dentro da faixa medida de 100–150 px/s. */
const DECOR_BOXES = 7;

/** Textura A8 inline no fluxo do statement (decorativa: alt=""). */
function Texture({ index }: { index: 0 | 1 }) {
  const path = TEXTURES[index];
  const resolved = resolveAsset(path);
  if (!resolved.render) return null;

  return (
    <Image
      src={resolved.src}
      {...thirdPartyAttrs(path)}
      alt=""
      width={TEXTURE_FILE.width}
      height={TEXTURE_FILE.height}
      sizes={TEXTURE_SIZES}
      className={styles.texture}
    />
  );
}

export default async function Banner() {
  const t = await getTranslations("banner");

  const copy = t.raw("copy") as ConfirmField;
  const draftLines = t.raw("draftLines") as string[];
  const confirm = copy.confirm === true;

  // As POSIÇÕES das texturas são layout (não copy): textura 1 entre as linhas
  // 1–2 do rascunho; textura 2 após a linha 4. As STRINGS vêm todas de
  // banner.draftLines (L1 — nada hardcoded).
  const [lineA, lineB, lineC, lineD, lineE] = draftLines;

  return (
    <section
      className={styles.section}
      data-section="banner"
      data-tone="light"
    >
      <div className={styles.container}>
        <div className={styles.display}>
          {/* Marquee decorativo: caixas VAZIAS contornadas. Raiz aria-hidden
              (lei de duplicação do Marquee: conteúdo decorativo não pode
              carregar texto acessível — aqui não carrega texto nenhum). */}
          <div className={styles.decor}>
            <Marquee
              decorative
              direction="right"
              speed={20}
              repeat={2}
              gap="0px"
              className={styles.decorTrack}
            >
              {Array.from({ length: DECOR_BOXES }, (_, i) => (
                <span key={i} className={styles.decorBox} />
              ))}
            </Marquee>
          </div>

          <div className={styles.content}>
            <p className={`eyebrow ${styles.eyebrow}`}>{t("eyebrow")}</p>

            {confirm && !OMIT_UNCONFIRMED ? (
              <p className={styles.confirmTag} data-confirm="true">
                {copy.value}
              </p>
            ) : null}

            <h2
              className={styles.statement}
              data-confirm={confirm ? "true" : undefined}
            >
              <span className={styles.line}>
                {lineA} <Texture index={0} /> {lineB}
              </span>
              <span className={styles.line}>{lineC}</span>
              <span className={styles.line}>
                {lineD} <Texture index={1} />
              </span>
              <span className={styles.line}>{lineE}</span>
            </h2>

            {confirm && !OMIT_UNCONFIRMED ? (
              <p className={styles.draftNotice}>{t("draftNotice")}</p>
            ) : null}

            <div className={styles.ctaRow}>
              <Button variant="primary" href="#contato" className={styles.cta}>
                {t("cta")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
