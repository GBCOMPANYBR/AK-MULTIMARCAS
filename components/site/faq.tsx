"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Quais documentos preciso levar para alugar?",
    a: "CNH válida (dentro da categoria do veículo), documento de identidade com foto e comprovante de residência.",
  },
  {
    q: "É necessário pagar caução?",
    a: "Sim, o valor varia conforme a categoria do veículo e é devolvido integralmente após a conferência do carro na devolução, descontados eventuais débitos.",
  },
  {
    q: "Qual a idade mínima para alugar?",
    a: "21 anos completos e CNH definitiva com pelo menos 1 ano de habilitação.",
  },
  {
    q: "Existe franquia de quilometragem?",
    a: "Sim, cada veículo possui uma franquia diária. O km excedente é cobrado conforme a tabela vigente, informada no contrato.",
  },
  {
    q: "O que acontece se eu atrasar a devolução?",
    a: "Atrasos geram cobrança de diárias extras proporcionais ao tempo excedido. Fale com a gente para renovar o contrato e evitar surpresas.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 py-20 sm:py-28">
      <div className="text-center mb-10">
        <span className="font-heading text-xs uppercase tracking-[0.3em] text-ak-red-glow">Dúvidas</span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ak-silver-light mt-2">
          Perguntas frequentes
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {faqs.map((f, i) => (
          <div key={i} className="border border-white/10 rounded-md bg-ak-black-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-heading font-medium text-ak-silver-light">{f.q}</span>
              <span className="text-ak-red-glow text-xl leading-none">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="px-5 pb-4 text-sm text-ak-silver-dark">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
