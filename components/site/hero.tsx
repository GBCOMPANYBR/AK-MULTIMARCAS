import { buildWhatsappLink, siteConfig } from "@/lib/config";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ak-black">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-20 h-[32rem] w-[32rem] rounded-full bg-ak-red/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-ak-silver/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-24 sm:pt-28 sm:pb-32 flex flex-col items-center text-center">
        <span className="animate-fade-up font-heading text-xs uppercase tracking-[0.3em] text-ak-red-glow mb-4">
          Locação de veículos
        </span>
        <h1 className="animate-fade-up font-heading text-4xl sm:text-6xl font-bold leading-tight max-w-3xl">
          <span className="text-gradient-metal">Do popular ao luxo.</span>
          <br />
          <span className="text-white">O carro certo para o seu momento.</span>
        </h1>
        <p className="animate-fade-up text-ak-silver-dark max-w-xl mt-6 text-base sm:text-lg">
          {siteConfig.tagline} Frota revisada, atendimento rápido e reserva direto pelo WhatsApp —
          sem burocracia.
        </p>
        <div className="animate-fade-up flex flex-col sm:flex-row gap-4 mt-10">
          <a
            href={buildWhatsappLink("Olá! Quero alugar um carro com a AK Multimarcas.")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading uppercase font-semibold text-sm px-8 py-4 bg-ak-red text-white rounded-sm shadow-[0_0_30px_-4px_rgba(225,6,0,0.7)] hover:bg-ak-red-glow transition-colors"
          >
            Alugue agora
          </a>
          <a
            href="#frota"
            className="font-heading uppercase font-semibold text-sm px-8 py-4 border border-ak-silver-dark text-ak-silver-light rounded-sm hover:border-white hover:text-white transition-colors"
          >
            Ver frota
          </a>
        </div>
      </div>
    </section>
  );
}
