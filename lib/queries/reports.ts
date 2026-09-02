import { prisma } from "@/lib/prisma";

export interface RentalHistoryFilters {
  clientId?: string;
  vehicleId?: string;
  status?: string;
  start?: string;
  end?: string;
}

export async function getRentalHistory(filters: RentalHistoryFilters) {
  return prisma.rental.findMany({
    where: {
      clientId: filters.clientId || undefined,
      vehicleId: filters.vehicleId || undefined,
      status: (filters.status as never) || undefined,
      pickupDatetime: {
        gte: filters.start ? new Date(filters.start) : undefined,
        lte: filters.end ? new Date(`${filters.end}T23:59:59`) : undefined,
      },
    },
    include: { client: true, vehicle: true },
    orderBy: { pickupDatetime: "desc" },
  });
}

export async function getVehicleRanking() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      rentals: {
        where: { status: { in: ["CONCLUIDA", "ATIVA"] } },
      },
    },
  });

  return vehicles
    .map((v) => {
      const kmDriven = v.rentals.reduce((sum, r) => {
        if (r.kmIn != null) return sum + (r.kmIn - r.kmOut);
        return sum;
      }, 0);
      return {
        id: v.id,
        name: `${v.brand} ${v.model}`,
        plate: v.plate,
        rentalsCount: v.rentals.length,
        kmDriven,
      };
    })
    .sort((a, b) => b.rentalsCount - a.rentalsCount);
}

function overlapDays(
  rangeStart: Date,
  rangeEnd: Date,
  periodStart: Date,
  periodEnd: Date
): number {
  const start = rangeStart > periodStart ? rangeStart : periodStart;
  const end = rangeEnd < periodEnd ? rangeEnd : periodEnd;
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return diff / (1000 * 60 * 60 * 24);
}

export async function getOccupancyRate(periodStart: Date, periodEnd: Date) {
  const [vehicleCount, rentals] = await Promise.all([
    prisma.vehicle.count({ where: { status: { not: "INATIVO" } } }),
    prisma.rental.findMany({
      where: {
        status: { in: ["ATIVA", "CONCLUIDA"] },
        pickupDatetime: { lte: periodEnd },
        OR: [{ actualReturnDatetime: { gte: periodStart } }, { actualReturnDatetime: null }],
      },
    }),
  ]);

  const now = new Date();
  const totalOccupiedDays = rentals.reduce((sum, r) => {
    const rentalEnd = r.actualReturnDatetime ?? (now < periodEnd ? now : periodEnd);
    return sum + overlapDays(r.pickupDatetime, rentalEnd, periodStart, periodEnd);
  }, 0);

  const periodDays = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const availableDays = Math.max(1, vehicleCount * periodDays);

  return Math.min(100, Math.round((totalOccupiedDays / availableDays) * 100));
}
