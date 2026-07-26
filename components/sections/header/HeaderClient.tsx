"use client";

import { useCallback, useEffect, useRef } from "react";
import { useOverlay } from "@/components/overlays/OverlayProvider";
import styles from "./StickyHeader.module.css";

/**
 * HeaderClient — comportamento do pill (comp S1+S2 + decisão F0-F5).
 *
 * TRACK DE TOM (W11-F). O estado do pill era
 * `scrollY >= innerHeight * 0.8` — um booleano num offset fixo, que
 * erra em TODA seção escura abaixo da dobra: o pill ficava no estilo
 * "sobre o claro" em cima da S6 Automação e da S9 Cases, ambas
 * escuras. O `fixedInvert` do modelo existe justamente porque a página
 * alterna tom. Agora o header lê qual `<section data-section data-tone>`
 * cruza o CENTRO VERTICAL do pill e escreve dois atributos:
 *   data-tone="light|dark"  → inverte a cor (CSS)
 *   data-active="true|false" → CTA preenche ao SAIR do hero
 *                              (awsmd-geometry → header.invertState:
 *                               o gatilho do modelo é "saída do hero",
 *                               não uma fração de viewport)
 *
 * MECANISMO — e por que NÃO é um track do useScrollTimeline.
 * O brief pedia um track no loop compartilhado (read → seção sob o
 * pill, write → dataset.tone, eq → string). Não usei, por duas razões
 * que só aparecem depois de olhar o ScrollProvider:
 *  1. O header é `position: fixed`, logo o IntersectionObserver do
 *     provider o reporta SEMPRE intersectando. O `activeSet` nunca
 *     esvazia e o loop NUNCA estaciona — matando a razão nº 3 de
 *     existir do ScrollProvider (60 Hz + lenis.raf perpétuos com a
 *     página parada e nada em tela).
 *  2. O provider não monta o loop sob reduced-motion. Tom e estado do
 *     CTA não são movimento, são legibilidade e affordance: sob
 *     reduced-motion o track ficaria morto e o CTA nunca preencheria —
 *     regressão frente ao listener que existia antes.
 * A banda de IntersectionObserver abaixo resolve as duas: root
 * encolhido por rootMargin a UMA linha de 1 px na altura do centro do
 * pill, então "que seção está sob o pill" vira uma pergunta que o
 * próprio observer responde. Zero rAF (o objetivo do brief), zero
 * leitura de layout por frame — o write acontece ~10 vezes na página
 * inteira, uma por fronteira de seção — e funciona nos dois modos de
 * motion.
 *
 * Decisão do Miguel, mantida: o pill de nav CONTINUA persistente (o do
 * modelo sai com o scroll). Divergência de uma propriedade em troca de
 * navegação numa página de 13 mil px. Aqui só a COR muda.
 *
 * - CTA com roll de texto (duas camadas, --ease-roll — comp: 0.35s).
 * - Menu hambúrguer e seletor de idioma abrem overlays (DEC-011).
 * - Reduced-motion: sem transição de cor nem roll (só troca de estado).
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

/** Seções que participam do track (todas as 10 já carregam os dois attrs). */
const SECTION_SELECTOR = "[data-section][data-tone]";

/** Estado serializado como string: o dedup é uma comparação de string. */
function stateOf(section: HTMLElement): string {
  const tone = section.dataset.tone === "dark" ? "dark" : "light";
  return `${section.dataset.section ?? ""}|${tone}`;
}

function applyState(header: HTMLElement, state: string): void {
  const sep = state.indexOf("|");
  const id = state.slice(0, sep);
  const tone = state.slice(sep + 1);
  header.dataset.tone = tone === "dark" ? "dark" : "light";
  // "Saída do hero" é o gatilho do preenchimento do CTA (spec do modelo).
  header.dataset.active = id === "hero" ? "false" : "true";
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
  // W4 (DEC-011): hambúrguer abre o O1 via OverlayProvider.
  const overlay = useOverlay();
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
    );
    if (sections.length === 0) return;

    /* Seções que cruzam a linha do pill AGORA. Numa fronteira exata as
       duas vizinhas podem cruzar no mesmo tick; ganha a última em ordem
       de documento — é a que o usuário está entrando. */
    const live = new Set<HTMLElement>();
    let io: IntersectionObserver | null = null;
    let last = "";

    const settle = () => {
      let chosen: HTMLElement | null = null;
      for (const section of sections) {
        if (live.has(section)) chosen = section;
      }
      if (!chosen) return; // entre seções (gap de layout): mantém o último tom
      const state = stateOf(chosen);
      if (state === last) return;
      last = state;
      applyState(header, state);
    };

    /* A banda depende da geometria do pill (top/height mudam no
       breakpoint mobile), então é reconstruída no resize. */
    const build = () => {
      io?.disconnect();
      live.clear();
      const rect = header.getBoundingClientRect();
      const mid = Math.round(rect.top + rect.height / 2);
      const bottom = Math.max(0, Math.round(window.innerHeight) - mid - 1);
      io = new IntersectionObserver(
        (records) => {
          for (const record of records) {
            const target = record.target as HTMLElement;
            if (record.isIntersecting) live.add(target);
            else live.delete(target);
          }
          settle();
        },
        { rootMargin: `-${mid}px 0px -${bottom}px 0px`, threshold: 0 },
      );
      for (const section of sections) io.observe(section);
    };

    build();
    window.addEventListener("resize", build, { passive: true });
    return () => {
      window.removeEventListener("resize", build);
      io?.disconnect();
    };
  }, []);

  const openContact = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      overlay.open("contact");
    },
    [overlay],
  );

  const isPt = currentLocale !== "en";

  return (
    /* Os data-attrs abaixo são o estado INICIAL (SSR + primeiro paint).
       O efeito acima assume a escrita; como os valores no JSX são
       constantes, nenhum re-render do React os desfaz. */
    <header
      ref={headerRef}
      className={styles.header}
      data-active="false"
      data-tone="light"
    >
      <a className={`hit-target ${styles.brand}`} href="#top">
        {brand}
      </a>

      <nav className={styles.nav}>
        {nav.map((item) => (
          <a
            key={item.href}
            className={`hit-target ${styles.navLink}`}
            href={item.href}
          >
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
          onClick={openContact}
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
