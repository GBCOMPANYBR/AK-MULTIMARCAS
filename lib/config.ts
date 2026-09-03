export const siteConfig = {
  name: "AK Multimarcas",
  legalName: "AK Multimarcas",
  cnpj: "65.384.586/0001-80",
  tagline: "Do popular ao luxo. O carro certo para o seu momento.",
  whatsappNumber: "5511947628138", // formato internacional sem símbolos
  phoneDisplay: "(11) 94762-8138",
  instagram: "https://instagram.com/ak_multimarcas5",
  address: "Rua Frei Mont'Alverne, 853 - Vila Aricanduva, São Paulo - SP - CEP 03505-030",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Rua+Frei+Mont'Alverne,+853+-+Vila+Aricanduva,+São+Paulo+-+SP&output=embed",
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
