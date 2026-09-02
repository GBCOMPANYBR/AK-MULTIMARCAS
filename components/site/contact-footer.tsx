import Image from "next/image";
import { buildWhatsappLink, siteConfig } from "@/lib/config";

export function ContactFooter() {
  return (
    <footer id="contato" className="bg-ak-black-soft border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Image src="/logo.jpg" alt="AK Multimarcas" width={44} height={44} className="rounded-sm" />
            <span className="font-heading font-bold text-xl text-ak-silver-light">AK Multimarcas</span>
          </div>
          <p className="text-sm text-ak-silver-dark max-w-sm mb-6">{siteConfig.tagline}</p>
          <div className="flex flex-col gap-2 text-sm text-ak-silver-dark">
            <a
              href={buildWhatsappLink("Olá! Quero falar com a AK Multimarcas.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              WhatsApp: {siteConfig.phoneDisplay}
            </a>
            <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            <span>{siteConfig.address}</span>
            <div className="mt-1">
              {siteConfig.hours.map((h) => (
                <div key={h.days}>
                  {h.days}: {h.time}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-md overflow-hidden border border-white/10 min-h-64">
          <iframe
            src={siteConfig.mapsEmbedUrl}
            loading="lazy"
            className="w-full h-full min-h-64 border-0"
            title="Localização AK Multimarcas"
          />
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ak-silver-dark">
        © {new Date().getFullYear()} {siteConfig.name} — CNPJ {siteConfig.cnpj}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
