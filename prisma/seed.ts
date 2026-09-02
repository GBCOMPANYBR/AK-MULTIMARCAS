import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateValidCPF(base: string): string {
  const digits = base.split("").map(Number);
  const calcDigit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += digits[i] * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calcDigit(9);
  digits.push(d1);
  const d2 = calcDigit(10);
  digits.push(d2);
  return digits.join("");
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const operatorPassword = await bcrypt.hash("operador123", 10);

  await prisma.user.upsert({
    where: { email: "admin@akmultimarcas.com.br" },
    update: {},
    create: {
      name: "Administrador AK",
      email: "admin@akmultimarcas.com.br",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "operador@akmultimarcas.com.br" },
    update: {},
    create: {
      name: "Operador AK",
      email: "operador@akmultimarcas.com.br",
      passwordHash: operatorPassword,
      role: "OPERATOR",
    },
  });

  // Reseta os dados de demonstração (frota, clientes, locações, financeiro, depoimentos)
  // para que o seed possa ser rodado de novo sempre com o mesmo estado consistente.
  await prisma.financeEntry.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();
  await prisma.testimonial.deleteMany();

  const vehiclesData = [
    {
      brand: "Renault",
      model: "Kwid Zen",
      year: 2023,
      color: "Branco",
      plate: "ABC1D23",
      category: "POPULAR" as const,
      currentKm: 21000,
      dailyRate: 79,
      weeklyRate: 460,
      monthlyRate: 1600,
      deposit: 400,
      kmFranchisePerDay: 200,
      kmExcessRate: 0.8,
      slug: "kwid",
      image: "/vehicles/renault-kwid.jpeg",
    },
    {
      brand: "Fiat",
      model: "Argo Drive",
      year: 2023,
      color: "Prata",
      plate: "ABC2D34",
      category: "POPULAR" as const,
      currentKm: 17500,
      dailyRate: 99,
      weeklyRate: 580,
      monthlyRate: 2000,
      deposit: 600,
      kmFranchisePerDay: 200,
      kmExcessRate: 0.9,
      slug: "argo",
      image: "/vehicles/fiat-argo.webp",
    },
    {
      brand: "Chevrolet",
      model: "Onix Premier",
      year: 2024,
      color: "Preto",
      plate: "ABC3D45",
      category: "INTERMEDIARIO" as const,
      currentKm: 11000,
      dailyRate: 129,
      weeklyRate: 750,
      monthlyRate: 2600,
      deposit: 800,
      kmFranchisePerDay: 200,
      kmExcessRate: 1.1,
      slug: "onix-premier",
      image: "/vehicles/chevrolet-onix-premier.png",
    },
    {
      brand: "Volkswagen",
      model: "Nivus Highline",
      year: 2024,
      color: "Cinza Grafite",
      plate: "ABC4D56",
      category: "INTERMEDIARIO" as const,
      currentKm: 8900,
      dailyRate: 159,
      weeklyRate: 930,
      monthlyRate: 3200,
      deposit: 900,
      kmFranchisePerDay: 200,
      kmExcessRate: 1.2,
      slug: "nivus",
      image: "/vehicles/vw-nivus.webp",
    },
    {
      brand: "Hyundai",
      model: "Creta Ultimate",
      year: 2024,
      color: "Branco Perolizado",
      plate: "ABC5D67",
      category: "SUV" as const,
      currentKm: 7500,
      dailyRate: 199,
      weeklyRate: 1150,
      monthlyRate: 3900,
      deposit: 1200,
      kmFranchisePerDay: 200,
      kmExcessRate: 1.3,
      slug: "creta",
      image: "/vehicles/hyundai-creta.webp",
    },
    {
      brand: "Mitsubishi",
      model: "ASX HPE",
      year: 2023,
      color: "Cinza",
      plate: "ABC6D78",
      category: "SUV" as const,
      currentKm: 14200,
      dailyRate: 219,
      weeklyRate: 1270,
      monthlyRate: 4300,
      deposit: 1300,
      kmFranchisePerDay: 200,
      kmExcessRate: 1.4,
      slug: "asx",
      image: "/vehicles/mitsubishi-asx.jpeg",
    },
    {
      brand: "Volkswagen",
      model: "Taos Highline",
      year: 2024,
      color: "Prata",
      plate: "ABC7D89",
      category: "SUV" as const,
      currentKm: 6100,
      dailyRate: 239,
      weeklyRate: 1390,
      monthlyRate: 4700,
      deposit: 1500,
      kmFranchisePerDay: 200,
      kmExcessRate: 1.5,
      slug: "taos",
      image: "/vehicles/vw-taos.webp",
    },
    {
      brand: "Kia",
      model: "Sportage EX",
      year: 2024,
      color: "Preto Metálico",
      plate: "ABC8D90",
      category: "PREMIUM" as const,
      currentKm: 4200,
      dailyRate: 289,
      weeklyRate: 1680,
      monthlyRate: 5700,
      deposit: 2000,
      kmFranchisePerDay: 150,
      kmExcessRate: 1.9,
      slug: "sportage",
      image: "/vehicles/kia-sportage.png",
    },
  ];

  const vehicles = [];
  for (let i = 0; i < vehiclesData.length; i++) {
    const v = vehiclesData[i];
    let status: "DISPONIVEL" | "ALUGADO" | "MANUTENCAO" | "INATIVO" = "DISPONIVEL";
    const showOnSite = true;
    if (i === vehiclesData.length - 1) {
      status = "MANUTENCAO";
    }

    const vehicle = await prisma.vehicle.upsert({
      where: { plate: v.plate },
      update: {},
      create: {
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        plate: v.plate,
        renavam: String(100000000 + i * 7654321).slice(0, 11),
        chassis: `9BW${v.slug.toUpperCase().replace(/-/g, "").slice(0, 14)}`,
        category: v.category,
        currentKm: v.currentKm,
        dailyRate: v.dailyRate,
        weeklyRate: v.weeklyRate,
        monthlyRate: v.monthlyRate,
        deposit: v.deposit,
        kmFranchisePerDay: v.kmFranchisePerDay,
        kmExcessRate: v.kmExcessRate,
        status,
        showOnSite,
        licensingExpiry: daysFromNow(120),
        ipvaExpiry: daysFromNow(45),
        insuranceExpiry: daysFromNow(200),
        images: {
          create: [
            {
              url: v.image,
              isPrimary: true,
              order: 0,
            },
          ],
        },
      },
    });
    vehicles.push(vehicle);
  }

  // Um veículo próximo do vencimento do IPVA/licenciamento para o dashboard mostrar alerta
  await prisma.vehicle.update({
    where: { id: vehicles[2].id },
    data: { ipvaExpiry: daysFromNow(5), licensingExpiry: daysFromNow(10) },
  });

  const clientsData = [
    {
      fullName: "Carlos Eduardo Souza",
      cpfBase: "52998224", // + 1 dígito extra necessário (9 dígitos base)
      rg: "34.567.890-1",
      cnhNumber: "01234567890",
      cnhCategory: "B",
      cnhExpiry: daysFromNow(365),
      phone: "11987654321",
      email: "carlos.souza@example.com",
      address: "Rua das Flores, 123 - São Paulo, SP",
      notes: "Cliente antigo, sempre pontual.",
    },
    {
      fullName: "Marina Ferreira Lima",
      cpfBase: "111444777",
      rg: "22.333.444-5",
      cnhNumber: "09876543210",
      cnhCategory: "AB",
      cnhExpiry: daysFromNow(20),
      phone: "11976543210",
      email: "marina.lima@example.com",
      address: "Av. Brasil, 456 - São Paulo, SP",
      notes: "CNH vence em breve — avisar na próxima locação.",
    },
    {
      fullName: "Roberto Almeida Santos",
      cpfBase: "123456789",
      rg: "11.222.333-4",
      cnhNumber: "05555444333",
      cnhCategory: "B",
      cnhExpiry: daysFromNow(500),
      phone: "11965432109",
      email: "roberto.almeida@example.com",
      address: "Rua Voluntários, 789 - Guarulhos, SP",
      notes: "",
    },
    {
      fullName: "Juliana Costa Ribeiro",
      cpfBase: "987654321",
      rg: "55.666.777-8",
      cnhNumber: "07778889990",
      cnhCategory: "B",
      cnhExpiry: daysFromNow(800),
      phone: "11954321098",
      email: "juliana.ribeiro@example.com",
      address: "Alameda Santos, 321 - São Paulo, SP",
      notes: "Bom pagador, já alugou carros de luxo antes.",
    },
  ];

  const clients = [];
  for (const c of clientsData) {
    const cpf = generateValidCPF(c.cpfBase.padEnd(9, "0").slice(0, 9));
    const client = await prisma.client.upsert({
      where: { cpf },
      update: {},
      create: {
        fullName: c.fullName,
        cpf,
        rg: c.rg,
        cnhNumber: c.cnhNumber,
        cnhCategory: c.cnhCategory,
        cnhExpiry: c.cnhExpiry,
        phone: c.phone,
        email: c.email,
        address: c.address,
        notes: c.notes,
      },
    });
    clients.push(client);
  }

  // Locação 1: ativa, dentro do prazo
  const activeVehicle = vehicles[3];
  await prisma.vehicle.update({
    where: { id: activeVehicle.id },
    data: { status: "ALUGADO" },
  });
  await prisma.rental.create({
    data: {
      clientId: clients[0].id,
      vehicleId: activeVehicle.id,
      pickupDatetime: daysFromNow(-2),
      expectedReturnDatetime: daysFromNow(3),
      kmOut: activeVehicle.currentKm,
      fuelOut: 8,
      dailyRate: activeVehicle.dailyRate,
      numDays: 5,
      deposit: activeVehicle.deposit,
      depositMethod: "PIX",
      paymentMethod: "PIX",
      paymentStatus: "PARCIAL",
      amountPaid: activeVehicle.dailyRate * 5 * 0.5,
      totalAmount: activeVehicle.dailyRate * 5,
      status: "ATIVA",
      checklists: {
        create: [
          {
            type: "SAIDA",
            conditionNotes: "Veículo em ótimo estado, sem avarias.",
          },
        ],
      },
    },
  });

  // Locação 2: ativa e atrasada (pra aparecer no alerta do dashboard)
  const overdueVehicle = vehicles[5];
  await prisma.vehicle.update({
    where: { id: overdueVehicle.id },
    data: { status: "ALUGADO" },
  });
  await prisma.rental.create({
    data: {
      clientId: clients[1].id,
      vehicleId: overdueVehicle.id,
      pickupDatetime: daysFromNow(-6),
      expectedReturnDatetime: daysFromNow(-1),
      kmOut: overdueVehicle.currentKm,
      fuelOut: 8,
      dailyRate: overdueVehicle.dailyRate,
      numDays: 5,
      deposit: overdueVehicle.deposit,
      depositMethod: "CARTAO",
      paymentMethod: "CARTAO",
      paymentStatus: "PAGO",
      amountPaid: overdueVehicle.dailyRate * 5,
      totalAmount: overdueVehicle.dailyRate * 5,
      status: "ATIVA",
      checklists: {
        create: [
          {
            type: "SAIDA",
            conditionNotes: "Pequeno risco no para-choque traseiro (pré-existente).",
          },
        ],
      },
    },
  });

  // Locação 3: concluída
  const completedVehicle = vehicles[0];
  const kmOut = completedVehicle.currentKm - 450;
  const kmIn = completedVehicle.currentKm;
  await prisma.rental.create({
    data: {
      clientId: clients[2].id,
      vehicleId: completedVehicle.id,
      pickupDatetime: daysFromNow(-15),
      expectedReturnDatetime: daysFromNow(-10),
      actualReturnDatetime: daysFromNow(-10),
      kmOut,
      kmIn,
      fuelOut: 8,
      fuelIn: 7,
      dailyRate: completedVehicle.dailyRate,
      numDays: 5,
      deposit: completedVehicle.deposit,
      depositMethod: "PIX",
      depositReturned: true,
      paymentMethod: "PIX",
      paymentStatus: "PAGO",
      amountPaid: completedVehicle.dailyRate * 5 + 25,
      kmExcessCharge: 0,
      fuelCharge: 25,
      totalAmount: completedVehicle.dailyRate * 5 + 25,
      status: "CONCLUIDA",
      checklists: {
        create: [
          { type: "SAIDA", conditionNotes: "Sem avarias." },
          { type: "DEVOLUCAO", conditionNotes: "Devolvido com 1 nível de combustível a menos." },
        ],
      },
    },
  });

  await prisma.financeEntry.createMany({
    data: [
      {
        type: "RECEITA",
        category: "Locação",
        amount: completedVehicle.dailyRate * 5 + 25,
        date: daysFromNow(-10),
        description: `Locação concluída - ${completedVehicle.brand} ${completedVehicle.model}`,
        vehicleId: completedVehicle.id,
      },
      {
        type: "DESPESA",
        category: "Manutenção",
        amount: 380,
        date: daysFromNow(-20),
        description: "Troca de óleo e filtros",
        vehicleId: vehicles[7].id,
      },
      {
        type: "DESPESA",
        category: "IPVA",
        amount: 1250,
        date: daysFromNow(-30),
        description: "IPVA anual",
        vehicleId: vehicles[2].id,
      },
      {
        type: "DESPESA",
        category: "Lavagem",
        amount: 60,
        date: daysFromNow(-3),
        description: "Lavagem completa",
        vehicleId: vehicles[4].id,
      },
    ],
  });

  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicles[7].id,
      date: daysFromNow(-20),
      km: vehicles[7].currentKm,
      description: "Troca de óleo e filtros",
      cost: 380,
    },
  });

  await prisma.testimonial.createMany({
    data: [
      {
        clientName: "Carlos Eduardo",
        rating: 5,
        text: "Atendimento excelente e carro impecável. Aluguei um SUV para uma viagem em família e não tive nenhum problema.",
        order: 0,
      },
      {
        clientName: "Marina Lima",
        rating: 5,
        text: "Processo super rápido pelo WhatsApp, retirei o carro em menos de 30 minutos.",
        order: 1,
      },
      {
        clientName: "Roberto Santos",
        rating: 4,
        text: "Ótimo custo-benefício, recomendo para quem precisa de um carro popular com preço justo.",
        order: 2,
      },
      {
        clientName: "Juliana Ribeiro",
        rating: 5,
        text: "Já aluguei o Kia Sportage pra uma viagem em família e a experiência foi incrível, carro impecável.",
        order: 3,
      },
    ],
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
