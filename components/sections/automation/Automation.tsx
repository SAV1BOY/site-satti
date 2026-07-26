import Image from "next/image";
import { getTranslations } from "next-intl/server";

import AutomationLine from "@/components/ui/AutomationLine";
import Button from "@/components/ui/Button";
import Marquee from "@/components/ui/Marquee";
import { resolveAsset, thirdPartyAttrs } from "@/lib/third-party";
import PhoneVideo from "./PhoneVideo";
import styles from "./Automation.module.css";

/**
 * S6 — Automação (seção DARK). Server Component (L11): o único client child é
 * o PhoneVideo (gate de IO do §8) — TODA a coreografia desta seção é CSS.
 *
 * Fonte de geometria: design/awsmd-ref/awsmd-geometry.json → `automation`
 * (+ awsmd-motion.json → ghost-marquee / phone-float / dev-foreground-sticky).
 * Copy: content/home.pt-BR.json (L1 — nada inventado aqui).
 *
 * ── Por que a seção era 3,5× mais curta que o modelo ────────────────────────
 * `parity:dom` media 9,7% da altura da página contra 30,2% do modelo. A causa
 * não era espaçamento: FALTAVAM as três camadas de altura do modelo. A altura
 * do modelo (3.758px @1080) fecha numa identidade de quatro termos:
 *
 *     header ~316  +  parede 3×795,6 = 2.386,8  +  padding 115  +  mão 940
 *   = 3.757,8 ≈ 3.758
 *
 * É essa identidade que fixa a leitura do spec pack: a parede é de **3 fileiras
 * de 5 slots** (15 slots, 12 preenchidos), não 3 colunas de 5 — 3 colunas dariam
 * 5 fileiras = 3.978px só de parede e a conta não fecharia em nenhum arranjo.
 * `mosaic.columns: 3` do JSON é resíduo da assinatura de parallax por coluna que
 * a DEC-021 §3 apagou; a DEC-021 já corrige o modelo mental para "3 fileiras
 * flex". As larguras responsivas confirmam: 5 slots sangram a viewport em TODOS
 * os patamares (1.953>1920 · 1.679>1600 · 1.679>1366 · 1.132>991 · 830>565),
 * que é exatamente o que se espera de uma parede full-bleed.
 *
 * A distribuição 5/5/2 das 12 telas nos 15 slots é INFERÊNCIA (o spec pack dá
 * contagem, não posição). A dimensão que a paridade mede — a altura — é
 * invariante à distribuição: são 3 fileiras em qualquer arranjo.
 *
 * ── DEC-021 §3: duas camadas de movimento NÃO existem ───────────────────────
 * Não há parallax de 3 colunas no mosaico nem parallax 0,6 na mão. A parede é
 * estática e a mão é `position: sticky` — o diferencial de velocidade medido era
 * o primeiro plano SEGURANDO enquanto as fileiras rolavam. Logo esta seção não
 * abre um único rAF: ghost marquee e float dos phones são keyframes, a mão é uma
 * linha de CSS, e o desenho do fio já roda no loop compartilhado dentro do
 * <AutomationLine>. Custo em JS de cliente desta wave: zero.
 *
 * ── Dois <AutomationLine>, um por sub-bloco ─────────────────────────────────
 * Contrato de components/ui/automation-thread-plan.ts (W11-F): com a seção em
 * ~3,9k px, um segmento único daria ~15s de viagem do pulso — um quarto de
 * minuto em que nenhuma outra zona pode ser dona do único pulso do site.
 * Os dois wrappers são metades geométricas (top 0/50%, height 50%), não recortes
 * de conteúdo: o handshake A→B acontece no mesmo x (0,62) do plano, então a
 * costura no meio da seção é invisível, e cada segmento fica com ~1,95k px.
 *
 * ── Camadas (z) ────────────────────────────────────────────────────────────
 * 0 ghost marquee + fio · 1 header/parede · 2 mão+vídeo (sticky) · 3 phones.
 *
 * V2-D2: phones, telas do mosaico e mão passam por `resolveAsset()`; o vídeo e o
 * poster do slot A6 são resolvidos dentro do PhoneVideo.
 */

/** Paths definitivos do MANIFEST (§8 — A6 · Phone S6). */
const PHONE_VIDEO_SRC = "/media/phone.mp4";
/* @resolved-by PhoneVideo — só declaração de path; a decisão draft/final é
   do resolveAsset() dentro do PhoneVideo. */
const PHONE_POSTER_SRC = "/media/phone-poster.webp";

/** PH-L / PH-R (MANIFEST §8) — mockups que flutuam sobre a parede. */
const PHONE_LEFT_SRC = "/img/automation/phone-left.webp";
const PHONE_RIGHT_SRC = "/img/automation/phone-right.webp";
/** A9 — recorte fotográfico com alpha; a tela do telefone é transparente. */
const HAND_SRC = "/img/automation/hand.webp";

/**
 * SC01–SC12 em 3 fileiras de 5 slots (12 preenchidos — ver doc acima).
 * A terceira fileira usa as duas pontas: é onde a mão sticky ocupa o centro.
 */
const SCREEN_ROWS: readonly (readonly string[])[] = [
  ["01", "02", "03", "04", "05"],
  ["06", "07", "08", "09", "10"],
  ["11", "12"],
];

const screenSrc = (n: string) => `/img/automation/screen-${n}.webp`;

/** Dimensões INTRÍNSECAS (o CSS reescala por patamar via custom property). */
const SCREEN_W = 365;
const SCREEN_H = 770;

/**
 * Renderiza o título D2 a partir da string oficial do JSON:
 * "{PALAVRA} RESTO **" → chaves e ** em steel (aria-hidden — leitores
 * de tela ouvem só "PALAVRA RESTO"). Se a copy mudar de forma, cai no
 * fallback literal (copy-law L1: nunca reescrever).
 */
function TitleContent({ raw }: { raw: string }) {
  const match = /^\{([^}]+)\}\s+(.+?)\s+\*\*$/.exec(raw.trim());
  if (match === null) {
    return <>{raw}</>;
  }
  const [, word, rest] = match;
  return (
    <>
      <span className={styles.steel} aria-hidden="true">
        {"{"}
      </span>
      {word}
      <span className={styles.steel} aria-hidden="true">
        {"}"}
      </span>
      <br className={styles.mobileBreak} aria-hidden="true" />{" "}
      {rest}{" "}
      <span className={styles.steel} aria-hidden="true">
        **
      </span>
    </>
  );
}

/** Uma tela da parede. Sem overlay de logo: os do modelo são de TERCEIROS e a
 *  W12 não tem autorização; sem rótulo mono, porque não existe copy oficial
 *  para as telas e a L1 proíbe inventar. */
function Screen({ n }: { n: string }) {
  const src = screenSrc(n);
  const asset = resolveAsset(src);
  if (!asset.render) return null;
  return (
    <div className={styles.screen}>
      <Image
        src={asset.src}
        {...thirdPartyAttrs(src)}
        alt=""
        width={SCREEN_W}
        height={SCREEN_H}
        className={styles.screenImg}
      />
    </div>
  );
}

export default async function Automation() {
  const t = await getTranslations();

  // t.raw: as chaves {} da copy oficial são sintaxe ICU p/ o t() normal.
  const rawTitle: unknown = t.raw("automation.title");
  const title = typeof rawTitle === "string" ? rawTitle : "";

  // Descrição existe só na comp mobile; o CSS a esconde ≥768px.
  const rawDescription: unknown = t.raw("automation.description");
  const description =
    typeof rawDescription === "string" && rawDescription.length > 0
      ? rawDescription
      : null;

  /* Labels dos nodes do fio (D3). O plano dá n1/n2 no sub-bloco A e n3 no B —
     os 3 passos oficiais (CAPTURA/AGENTES/ENTREGA) continuam cobertos. */
  const rawSteps: unknown = t.raw("automation.steps");
  const steps = Array.isArray(rawSteps)
    ? rawSteps.filter((s): s is string => typeof s === "string")
    : [];
  const [stepOne, stepTwo, stepThree] = steps;
  const labelsA =
    stepOne !== undefined && stepTwo !== undefined
      ? { n1: stepOne, n2: stepTwo }
      : undefined;
  const labelsB = stepThree !== undefined ? { n3: stepThree } : undefined;

  /* Ghost marquee: MESMO texto da faixa de posicionamento (values.items,
     separadores inclusos) — é o que o modelo faz, e é copy oficial literal. */
  const rawGhost: unknown = t.raw("values.items");
  const ghostItems = Array.isArray(rawGhost)
    ? rawGhost.filter((s): s is string => typeof s === "string")
    : [];

  const phoneLeft = resolveAsset(PHONE_LEFT_SRC);
  const phoneRight = resolveAsset(PHONE_RIGHT_SRC);
  const hand = resolveAsset(HAND_SRC);

  return (
    <section
      id="automacao"
      className={`section-dark ${styles.section}`}
      data-section="automation"
      data-tone="dark"
    >
      {/* Marquee fantasma — atrás de tudo, decoração pura (raiz aria-hidden
          via `decorative`). 20s / direção `right` (DEC-021 corrigiu os 40s do
          spec pack; `--dur-ghost` em tokens.css ainda diz 40s e está fora do
          ownership desta wave, por isso a duração vem da prop). */}
      <div className={styles.ghost}>
        <Marquee
          direction="right"
          speed={20}
          gap="0.28em"
          decorative
          className={styles.ghostTrack}
        >
          {ghostItems.map((item, i) => (
            <span key={`${item}-${i}`} className={styles.ghostWord}>
              {item}
            </span>
          ))}
        </Marquee>
      </div>

      {/* Metades geométricas do fio (não recortes de conteúdo) — ver doc. */}
      <div className={`${styles.lineZone} ${styles.lineZoneA}`}>
        <AutomationLine zone="automation-a" tone="dark" nodeLabels={labelsA} />
      </div>
      <div className={`${styles.lineZone} ${styles.lineZoneB}`}>
        <AutomationLine zone="automation-b" tone="dark" nodeLabels={labelsB} />
      </div>

      <div className={`container-s ${styles.inner}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{t("automation.eyebrow")}</p>

        <h2 className={styles.title}>
          <TitleContent raw={title} />
        </h2>

        {description !== null ? (
          <p className={styles.description}>{description}</p>
        ) : null}

        <div className={styles.ctas}>
          <Button variant="primary" href="#portfolio">
            {t("automation.portfolioCta")}
          </Button>
          <Button variant="dark-ghost" href="#contato">
            {t("automation.contactCta")}
          </Button>
        </div>
      </div>

      {/* O palco começa DEPOIS do header, e não é organização de arquivo: ele é
          o containing block do sticky. A caixa de contenção de um sticky é o
          bloco pai, então com o header dentro do palco a mão podia subir até o
          topo da seção e cobria o título inteiro (medido). Começando no topo da
          parede, ela entra deslizando com a parede e só então gruda no rodapé
          da viewport. */}
      <div className={styles.stage}>
        {/* Parede de telas: 3 fileiras estáticas, full-bleed. */}
        <div className={styles.wall} aria-hidden="true">
          {SCREEN_ROWS.map((row, i) => (
            <div
              key={i}
              className={
                row.length < 5 ? `${styles.row} ${styles.rowEnds}` : styles.row
              }
            >
              {row.map((n) => (
                <Screen key={n} n={n} />
              ))}
            </div>
          ))}

          {/* Phones flutuando SOBRE a parede (z 3). A alternância é a fase:
              mesmo keyframe, o esquerdo com animation-delay -3s. */}
          <div className={styles.phones}>
            {phoneLeft.render ? (
              <Image
                src={phoneLeft.src}
                {...thirdPartyAttrs(PHONE_LEFT_SRC)}
                alt=""
                width={674}
                height={1100}
                className={`${styles.phone} ${styles.phoneLeft}`}
              />
            ) : null}
            {phoneRight.render ? (
              <Image
                src={phoneRight.src}
                {...thirdPartyAttrs(PHONE_RIGHT_SRC)}
                alt=""
                width={756}
                height={1236}
                className={`${styles.phone} ${styles.phoneRight}`}
              />
            ) : null}
          </div>
        </div>

        {/* Primeiro plano: o ÚNICO position:sticky do site. Segura a mão e o
            vídeo central no rodapé da viewport enquanto a parede rola — é isso
            que a DEC-021 §3 identificou como a origem do "parallax" medido.
            A caixa de 940px existe nos DOIS modos de asset: em `final` a mão é
            omitida (terceiro), e sem a caixa a seção encurtaria 940px e a
            paridade de altura mudaria conforme o modo de publicação. */}
        <div className={styles.foreground} aria-hidden="true">
          <div className={styles.video}>
            <PhoneVideo
              videoSrc={PHONE_VIDEO_SRC}
              posterSrc={PHONE_POSTER_SRC}
            />
          </div>

          {hand.render ? (
            <div className={styles.handWrap}>
              <Image
                src={hand.src}
                {...thirdPartyAttrs(HAND_SRC)}
                alt=""
                width={1920}
                height={1241}
                className={styles.hand}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
