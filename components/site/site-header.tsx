import Image from "next/image";
import Link from "next/link";
import { buildWhatsappLink } from "@/lib/config";

const links = [
  { href: "#frota", label: "Frota" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#faq", label: "FAQ" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ak-black/85 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="#top" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="AK Multimarcas" width={40} height={40} className="rounded-sm" />
          <span className="font-heading font-bold text-lg text-ak-silver-light hidden sm:inline">
            AK Multimarcas
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ak-silver-dark">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <Link href="/area-do-cliente" className="hover:text-white transition-colors">
            Área do cliente
          </Link>
        </nav>
        <a
          href={buildWhatsappLink("Olá! Quero alugar um carro com a AK Multimarcas.")}
          target="_blank"
          rel="noopener noreferrer"
          className="font-heading text-xs uppercase font-semibold bg-ak-red text-white px-4 py-2 rounded-sm hover:bg-ak-red-glow transition-colors"
        >
          Alugue agora
        </a>
      </div>
    </header>
  );
}
