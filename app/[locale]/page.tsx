/* Home SATTI — montagem das 11 seções (W3) na ordem do Atlas/D5:
   S1+S2 Hero → S3 Values → S4 Serviços → S5 Sobre → S6 Automação (dark)
   → S7 Portfólio → S8 Banner (dark) → S9 Cases → S10 Depoimentos → S11 Footer.
   AutomationThread envolve main + footer: o fio (D3) atravessa
   hero → serviços → automação → portfólio → contato com pulso único. */

import { setRequestLocale } from "next-intl/server";
import AutomationThread from "@/components/ui/AutomationThread";
import OverlayProvider from "@/components/overlays/OverlayProvider";
import MenuOverlay from "@/components/overlays/menu/MenuOverlay";
import ContactOverlay from "@/components/overlays/contact/ContactOverlay";
import LanguageOverlay from "@/components/overlays/language/LanguageOverlay";
import StickyHeader from "@/components/sections/header/StickyHeader";
import Hero from "@/components/sections/hero/Hero";
import ValuesStrip from "@/components/sections/values/ValuesStrip";
import Services from "@/components/sections/services/Services";
import About from "@/components/sections/about/About";
import Automation from "@/components/sections/automation/Automation";
import Portfolio from "@/components/sections/portfolio/Portfolio";
import Banner from "@/components/sections/banner/Banner";
import CasesSlider from "@/components/sections/cases/CasesSlider";
import Reviews from "@/components/sections/reviews/Reviews";
import Footer from "@/components/sections/footer/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <OverlayProvider
      menu={<MenuOverlay />}
      contact={<ContactOverlay />}
      language={<LanguageOverlay />}
    >
      <StickyHeader />
      <AutomationThread>
        <main id="top">
          <Hero />
          <ValuesStrip />
          <Services />
          <About />
          <Automation />
          <Portfolio />
          <Banner />
          <CasesSlider />
          <Reviews />
        </main>
        <Footer />
      </AutomationThread>
    </OverlayProvider>
  );
}
