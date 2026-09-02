import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/config";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akmultimarcas.com.br"),
  title: {
    default: `${siteConfig.name} — Locação de veículos do popular ao luxo`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "AK Multimarcas: locação de veículos do popular ao luxo. Frota revisada, atendimento rápido e reserva direto pelo WhatsApp.",
  openGraph: {
    title: `${siteConfig.name} — Locação de veículos do popular ao luxo`,
    description:
      "Do popular ao luxo, o carro certo para o seu momento. Reserve agora pelo WhatsApp.",
    images: ["/logo.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${rajdhani.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-ak-black">{children}</body>
    </html>
  );
}
