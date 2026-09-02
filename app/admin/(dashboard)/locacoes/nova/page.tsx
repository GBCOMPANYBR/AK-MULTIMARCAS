import { prisma } from "@/lib/prisma";
import { RentalForm } from "@/components/admin/rental-form";

export const metadata = { title: "Nova locação" };

export default async function NovaLocacaoPage() {
  const [clients, vehicles] = await Promise.all([
    prisma.client.findMany({ orderBy: { fullName: "asc" }, select: { id: true, fullName: true, cpf: true } }),
    prisma.vehicle.findMany({
      where: { status: "DISPONIVEL" },
      orderBy: { brand: "asc" },
      select: {
        id: true,
        brand: true,
        model: true,
        plate: true,
        currentKm: true,
        dailyRate: true,
        deposit: true,
        kmFranchisePerDay: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Nova locação</h1>
        <p className="text-sm text-ak-silver-dark">
          {vehicles.length === 0
            ? "Nenhum veículo disponível no momento."
            : `${vehicles.length} veículos disponíveis`}
        </p>
      </div>
      <RentalForm clients={clients} vehicles={vehicles} />
    </div>
  );
}
