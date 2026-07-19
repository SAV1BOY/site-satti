import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
import "../styles/tokens.css";
import "../globals.css";
import "../styles/animations.css";
import LenisProvider from "@/components/providers/LenisProvider";
import CursorProvider from "@/components/providers/CursorProvider";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const SITE_URL = "https://sattiai.com";

/**
 * Metadata por locale (§6-W7): hreflang pt-BR/en + canonical + OG.
 * Description = 1º statement OFICIAL da S5 (about.paragraphs[0] — L1:
 * nenhuma frase inventada em metadata).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const description = (t.raw("paragraphs") as string[])[0];
  const path = locale === "en" ? "/en" : "/";

  return {
    metadataBase: new URL(SITE_URL),
    title: "SATTI",
    description,
    alternates: {
      canonical: path,
      languages: {
        "pt-BR": "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: "SATTI",
      description,
      url: path,
      siteName: "SATTI",
      locale: locale === "en" ? "en_US" : "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "SATTI",
      description,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tFooter = await getTranslations({ locale, namespace: "footer" });

  // JSON-LD Organization (§6-W7) — dados oficiais do JSON (L1).
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SATTI",
    url: SITE_URL,
    email: tFooter("contactEmail"),
    sameAs: [tFooter("githubUrl")],
  };

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <NextIntlClientProvider>
          <LenisProvider>
            <CursorProvider>{children}</CursorProvider>
          </LenisProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
