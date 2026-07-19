import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./styles/tokens.css";
import "./globals.css";
import "./styles/animations.css";
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

export const metadata: Metadata = {
  title: "SATTI",
  description: "SATTI — sattiai.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          <CursorProvider>{children}</CursorProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
