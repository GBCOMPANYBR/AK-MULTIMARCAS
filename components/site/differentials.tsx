const items = [
  { title: "Frota revisada", desc: "Todos os veículos passam por revisão e checklist antes de cada locação." },
  { title: "Popular ao luxo", desc: "Do carro econômico do dia a dia ao modelo premium para ocasiões especiais." },
  { title: "Atendimento rápido", desc: "Reserva e confirmação em minutos, direto pelo WhatsApp." },
  { title: "Flexibilidade de prazos", desc: "Diárias, semanas ou meses — você escolhe o período ideal." },
  { title: "Entrega e retirada", desc: "Facilidade para retirar e devolver o veículo conforme sua necessidade." },
  { title: "Suporte durante a locação", desc: "Time disponível para qualquer imprevisto durante o período alugado." },
];

export function Differentials() {
  return (
    <section id="diferenciais" className="max-w-6xl mx-auto px-4 py-20 sm:py-28">
      <div className="text-center mb-14">
        <span className="font-heading text-xs uppercase tracking-[0.3em] text-ak-red-glow">Por que a AK</span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ak-silver-light mt-2">Diferenciais</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.title} className="border-l-2 border-ak-red pl-5 py-1">
            <h3 className="font-heading font-bold text-ak-silver-light">{item.title}</h3>
            <p className="text-sm text-ak-silver-dark mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
