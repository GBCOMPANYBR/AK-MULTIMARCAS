import { prisma } from "@/lib/prisma";
import { getRentalHistory, getVehicleRanking, getOccupancyRate } from "@/lib/queries/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Select, Input } from "@/components/ui/form";
import { LinkButton } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";

export const metadata = { title: "Relatórios" };

const statusTone = { ATIVA: "red", CONCLUIDA: "green", CANCELADA: "gray" } as const;

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string;
    vehicleId?: string;
    status?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;

  const periodEnd = params.end ? new Date(`${params.end}T23:59:59`) : new Date();
  const periodStart = params.start
    ? new Date(params.start)
    : new Date(periodEnd.getTime() - 30 * 86400000);

  const [clients, vehicles, rentals, ranking, occupancyRate] = await Promise.all([
    prisma.client.findMany({ orderBy: { fullName: "asc" }, select: { id: true, fullName: true } }),
    prisma.vehicle.findMany({ orderBy: { brand: "asc" }, select: { id: true, brand: true, model: true } }),
    getRentalHistory(params),
    getVehicleRanking(),
    getOccupancyRate(periodStart, periodEnd),
  ]);

  const exportQuery = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Relatórios</h1>
        <p className="text-sm text-ak-silver-dark">Ocupação, ranking e histórico de locações</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label={`Ocupação (${formatDateBR(periodStart)} – ${formatDateBR(periodEnd)})`}
          value={`${occupancyRate}%`}
        />
        <StatCard label="Veículo mais alugado" value={ranking[0]?.name ?? "—"} hint={ranking[0] ? `${ranking[0].rentalsCount} locações` : undefined} />
        <StatCard
          label="Total de KM rodados"
          value={`${ranking.reduce((s, v) => s + v.kmDriven, 0).toLocaleString("pt-BR")} km`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking de veículos</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ak-silver-dark text-xs uppercase border-b border-white/10">
                <th className="py-2">Veículo</th>
                <th className="py-2">Locações</th>
                <th className="py-2">KM rodados</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="py-2 text-ak-silver-light">
                    {v.name} <span className="text-ak-silver-dark text-xs">({v.plate})</span>
                  </td>
                  <td className="py-2 text-ak-silver-dark">{v.rentalsCount}</td>
                  <td className="py-2 text-ak-silver-dark">{v.kmDriven.toLocaleString("pt-BR")} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de locações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="text-xs text-ak-silver-dark uppercase">Cliente</label>
              <Select name="clientId" defaultValue={params.clientId ?? ""}>
                <option value="">Todos</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs text-ak-silver-dark uppercase">Veículo</label>
              <Select name="vehicleId" defaultValue={params.vehicleId ?? ""}>
                <option value="">Todos</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs text-ak-silver-dark uppercase">Status</label>
              <Select name="status" defaultValue={params.status ?? ""}>
                <option value="">Todos</option>
                <option value="ATIVA">Ativa</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </Select>
            </div>
            <div>
              <label className="text-xs text-ak-silver-dark uppercase">De</label>
              <Input name="start" type="date" defaultValue={params.start} />
            </div>
            <div>
              <label className="text-xs text-ak-silver-dark uppercase">Até</label>
              <Input name="end" type="date" defaultValue={params.end} />
            </div>
            <div className="lg:col-span-5">
              <button className="text-sm text-ak-silver-dark hover:text-ak-silver-light underline">
                Filtrar
              </button>
            </div>
          </form>

          <div className="flex gap-2">
            <LinkButton href={`/api/relatorios/export?${exportQuery}`} variant="outline" size="sm" target="_blank">
              Exportar CSV
            </LinkButton>
            <LinkButton href={`/api/relatorios/export-pdf?${exportQuery}`} variant="outline" size="sm" target="_blank">
              Exportar PDF
            </LinkButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ak-silver-dark text-xs uppercase border-b border-white/10">
                  <th className="py-2">Cliente</th>
                  <th className="py-2">Veículo</th>
                  <th className="py-2">Retirada</th>
                  <th className="py-2">Devolução</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-2 text-ak-silver-light">{r.client.fullName}</td>
                    <td className="py-2 text-ak-silver-dark">
                      {r.vehicle.brand} {r.vehicle.model}
                    </td>
                    <td className="py-2 text-ak-silver-dark">{formatDateBR(r.pickupDatetime)}</td>
                    <td className="py-2 text-ak-silver-dark">
                      {r.actualReturnDatetime ? formatDateBR(r.actualReturnDatetime) : "—"}
                    </td>
                    <td className="py-2 text-ak-silver-light">{formatCurrencyBRL(r.totalAmount)}</td>
                    <td className="py-2">
                      <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rentals.length === 0 && (
              <p className="text-center text-ak-silver-dark py-8">Nenhuma locação encontrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
