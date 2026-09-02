// TODO: substituir pelos dados reais da AK Multimarcas antes de publicar.
export const siteConfig = {
  name: "AK Multimarcas",
  tagline: "Do popular ao luxo. O carro certo para o seu momento.",
  whatsappNumber: "5511999999999", // formato internacional sem símbolos
  phoneDisplay: "(11) 99999-9999",
  instagram: "https://instagram.com/akmultimarcas",
  address: "Av. Exemplo, 1000 - São Paulo, SP",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Av.+Paulista,+São+Paulo&output=embed",
  hours: [
    { days: "Segunda a Sexta", time: "08h às 18h" },
    { days: "Sábado", time: "08h às 13h" },
  ],
};

export function buildWhatsappLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${text}`;
}

export const vehicleCategoryLabels: Record<string, string> = {
  POPULAR: "Popular",
  INTERMEDIARIO: "Intermediário",
  SUV: "SUV",
  PREMIUM: "Premium",
  LUXO: "Luxo",
};

export const vehicleStatusLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  ALUGADO: "Alugado",
  MANUTENCAO: "Em manutenção",
  INATIVO: "Inativo",
};

// Cobrança fixa por nível de combustível faltando na devolução (1 nível = 1/8 do tanque)
export const FUEL_LEVEL_CHARGE = 25;
