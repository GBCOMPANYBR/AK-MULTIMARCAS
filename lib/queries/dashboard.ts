import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
export async function getDashboardData() {
  const now = new Date();
  const today0 = startOfDay(now);
  const tomorrow0 = startOfDay(new Date(now.getTime() + 86400000));
  const dayAfterTomorrow0 = startOfDay(new Date(now.getTime() + 2 * 86400000));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in30Days = new Date(now.getTime() + 30 * 86400000);

  const [
    availableCount,
    rentedCount,
    maintenanceCount,
    activeRentalsCount,
    returnsToday,
    returnsTomorrow,
    overdueReturns,
    expiringDocs,
    monthlyRevenueEntries,
    totalVehicles,
    financeByMonth,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: "DISPONIVEL" } }),
    prisma.vehicle.count({ where: { status: "ALUGADO" } }),
    prisma.vehicle.count({ where: { status: "MANUTENCAO" } }),
    prisma.rental.count({ where: { status: "ATIVA" } }),
    prisma.rental.findMany({
      where: {
        status: "ATIVA",
        expectedReturnDatetime: { gte: today0, lt: tomorrow0 },
      },
      include: { client: true, vehicle: true },
    }),
    prisma.rental.findMany({
      where: {
        status: "ATIVA",
        expectedReturnDatetime: { gte: tomorrow0, lt: dayAfterTomorrow0 },
      },
      include: { client: true, vehicle: true },
    }),
    prisma.rental.findMany({
      where: { status: "ATIVA", expectedReturnDatetime: { lt: today0 } },
      include: { client: true, vehicle: true },
      orderBy: { expectedReturnDatetime: "asc" },
    }),
    prisma.vehicle.findMany({
      where: {
        OR: [
          { licensingExpiry: { lte: in30Days } },
          { ipvaExpiry: { lte: in30Days } },
          { insuranceExpiry: { lte: in30Days } },
        ],
        status: { not: "INATIVO" },
      },
    }),
    prisma.financeEntry.findMany({
      where: { type: "RECEITA", date: { gte: monthStart } },
    }),
    prisma.vehicle.count({ where: { status: { not: "INATIVO" } } }),
    prisma.financeEntry.findMany({
      where: {
        date: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
    }),
  ]);

  const monthlyRevenue = monthlyRevenueEntries.reduce((sum, e) => sum + e.amount, 0);
  const occupancyRate =
    totalVehicles > 0 ? Math.round((rentedCount / totalVehicles) * 100) : 0;

  const monthLabels = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString("pt-BR", { month: "short" }) };
  });

  const revenueChart = monthLabels.map(({ year, month, label }) => {
    const receita = financeByMonth
      .filter(
        (e) =>
          e.type === "RECEITA" &&
          e.date.getFullYear() === year &&
          e.date.getMonth() === month
      )
      .reduce((sum, e) => sum + e.amount, 0);
    const despesa = financeByMonth
      .filter(
        (e) =>
          e.type === "DESPESA" &&
          e.date.getFullYear() === year &&
          e.date.getMonth() === month
      )
      .reduce((sum, e) => sum + e.amount, 0);
    return { label, receita, despesa };
  });

  return {
    counts: {
      available: availableCount,
      rented: rentedCount,
      maintenance: maintenanceCount,
      activeRentals: activeRentalsCount,
    },
    returnsToday,
    returnsTomorrow,
    overdueReturns,
    expiringDocs,
    monthlyRevenue,
    occupancyRate,
    revenueChart,
  };
}
