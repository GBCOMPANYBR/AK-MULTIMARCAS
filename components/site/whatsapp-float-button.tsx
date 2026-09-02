"use client";

import Image from "next/image";
import { buildWhatsappLink } from "@/lib/config";

export function WhatsappFloatButton() {
  return (
    <a
      href={buildWhatsappLink("Olá! Quero saber mais sobre a locação de veículos da AK Multimarcas.")}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-ak-black-card border border-white/10 py-1.5 pl-1.5 pr-4 text-white shadow-lg shadow-black/50 hover:border-emerald-500/50 transition-colors"
      aria-label="Falar com a gente no WhatsApp"
    >
      <span className="relative block h-11 w-11 shrink-0 rounded-full overflow-hidden ring-2 ring-emerald-500">
        <Image src="/avatar-ak.png" alt="Atendimento AK Multimarcas" fill className="object-cover object-[50%_35%]" />
      </span>
      <span className="hidden sm:flex flex-col leading-tight">
        <span className="font-heading font-semibold text-sm">Fale com a gente</span>
        <span className="text-[11px] text-emerald-400">● Online no WhatsApp</span>
      </span>
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-emerald-400 sm:hidden">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.92 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.05h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.23-8.25 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.24-.65.8-.79.97-.15.16-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.24-.02-.37.11-.5.11-.11.25-.29.37-.43.12-.15.16-.24.24-.4.08-.17.04-.31-.02-.43-.06-.13-.56-1.36-.77-1.85-.2-.5-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.85.83-.85 2.03s.87 2.36 1 2.52c.12.17 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29Z" />
      </svg>
    </a>
  );
}
