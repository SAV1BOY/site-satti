/* /dev/ui — playground W2 (temporário, removido no W7 · ULTRAGOAL §6-W2).
   Demonstra todos os utilitários do núcleo UI com copy OFICIAL do JSON
   (L1) e a AutomationLine com 2 segmentos costurados + pulso único
   cruzando a fronteira (aceite do W2). */

import { getTranslations, setRequestLocale } from "next-intl/server";
import Button from "@/components/ui/Button";
import Marquee from "@/components/ui/Marquee";
import FillText from "@/components/ui/FillText";
import PulseCircle from "@/components/ui/PulseCircle";
import WorkCard from "@/components/ui/WorkCard";
import AutomationLine from "@/components/ui/AutomationLine";
import AutomationThread from "@/components/ui/AutomationThread";
import { TypewriterDemo } from "./demos";
import styles from "./page.module.css";

export default async function DevUiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tHero = await getTranslations("hero");
  const tAbout = await getTranslations("about");
  const tValues = await getTranslations("values");
  const tPortfolio = await getTranslations("portfolio");

  const words = tHero.raw("words") as string[];
  const aboutParagraphs = tAbout.raw("paragraphs") as string[];
  const valueItems = tValues.raw("items") as string[];
  const projects = tPortfolio.raw("items") as Array<{
    title: string;
    tag: string;
  }>;

  return (
    <main className={styles.main}>
      <header className={`container-s ${styles.section}`}>
        <span className="eyebrow">DEV / UI — PLAYGROUND W2</span>
      </header>

      {/* Button — 3 variantes do DS (roll 100% CSS) */}
      <section className={`container-s ${styles.section}`}>
        <p className={`eyebrow ${styles.sectionTitle}`}>BUTTON / ROLL</p>
        <div className={styles.row}>
          <Button href="#" arrow>
            {tPortfolio("allCta")}
          </Button>
          <Button href="#" variant="secondary">
            {tAbout("cta")}
          </Button>
        </div>
      </section>

      {/* Typewriter — palavras oficiais do hero */}
      <section className={`container-s ${styles.section}`}>
        <p className={`eyebrow ${styles.sectionTitle}`}>USE-TYPEWRITER</p>
        <TypewriterDemo words={words} />
      </section>

      {/* Marquee — itens da S3 ValuesStrip (Var A) */}
      <section className={styles.section}>
        <p className={`container-s eyebrow ${styles.sectionTitle}`}>MARQUEE</p>
        <Marquee speed={20}>
          {valueItems.map((item) => (
            <span key={item} className={styles.marqueeItem}>
              {item}
            </span>
          ))}
        </Marquee>
      </section>

      {/* FillText — statements oficiais da S5 */}
      <section className={`container-s ${styles.section}`}>
        <p className={`eyebrow ${styles.sectionTitle}`}>FILL-TEXT</p>
        {aboutParagraphs.map((statement) => (
          <FillText key={statement} className={styles.fillStatement}>
            {statement}
          </FillText>
        ))}
      </section>

      {/* PulseCircle — diagrama do método (S5) */}
      <section className={`container-s ${styles.section}`}>
        <p className={`eyebrow ${styles.sectionTitle}`}>PULSE-CIRCLE</p>
        <div className={styles.diagramBox}>
          <PulseCircle />
        </div>
      </section>

      {/* WorkCard — 2 projetos reais da S7 (posters placeholder até W5) */}
      <section className={`container-s ${styles.section}`}>
        <p className={`eyebrow ${styles.sectionTitle}`}>WORK-CARD</p>
        <div className={styles.workGrid}>
          {projects.slice(0, 2).map((project) => (
            <WorkCard
              key={project.title}
              title={project.title}
              tags={[project.tag]}
              videoSrc="/media/portfolio-1.mp4"
              posterSrc="/img/dev-poster.webp"
            />
          ))}
        </div>
      </section>

      {/* AutomationLine — 2 segmentos costurados + pulso único (D3) */}
      <AutomationThread>
        <section className={styles.zone}>
          <AutomationLine
            zone="services"
            tone="light"
            nodeLabels={{ n1: "[ N1 ]", n2: "[ N2 ]" }}
          />
          <div className={`container-s ${styles.zoneContent}`}>
            <p className="eyebrow">AUTOMATION-LINE / SEGMENTO CLARO</p>
            <p className={styles.hint}>
              [ D3 · fio contínuo · desenho no scroll · handshake x ]
            </p>
          </div>
        </section>
        <section className={styles.zoneDark}>
          <AutomationLine
            zone="automation"
            tone="dark"
            nodeLabels={{ n1: "[ N3 ]", n2: "[ N4 ]" }}
          />
          <div className={`container-s ${styles.zoneContent}`}>
            <p className="eyebrow">AUTOMATION-LINE / SEGMENTO ESCURO</p>
            <p className={styles.hint}>
              [ D3 · pulso único cruza a fronteira · reduced-motion = linha
              100% ]
            </p>
          </div>
        </section>
      </AutomationThread>
    </main>
  );
}
