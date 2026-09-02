const steps = [
  { n: "01", title: "Escolha o carro", desc: "Navegue pela nossa frota e encontre o veículo ideal para o seu momento." },
  { n: "02", title: "Fale no WhatsApp", desc: "Confirme disponibilidade, prazos e valores diretamente com nossa equipe." },
  { n: "03", title: "Assine e retire", desc: "Envie seus documentos, assine o contrato e retire o carro revisado." },
  { n: "04", title: "Desfrute tranquilamente", desc: "Aproveite sua viagem com suporte da AK Multimarcas o tempo todo." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-ak-black-soft border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-14">
          <span className="font-heading text-xs uppercase tracking-[0.3em] text-ak-red-glow">Simples assim</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ak-silver-light mt-2">
            Como funciona
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="relative diag-line bg-ak-black-card border border-white/10 p-6">
              <span className="font-heading text-4xl font-bold text-white/10">{s.n}</span>
              <h3 className="font-heading font-bold text-lg text-ak-silver-light mt-2">{s.title}</h3>
              <p className="text-sm text-ak-silver-dark mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
