import { getDashboardData } from "@/lib/queries/dashboard";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [data, session] = await Promise.all([getDashboardData(), auth()]);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Dashboard</h1>
        <p className="text-sm text-ak-silver-dark">Visão geral da operação da AK Multimarcas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Disponíveis" value={data.counts.available} tone="green" />
        <StatCard label="Alugados" value={data.counts.rented} tone="red" />
        <StatCard label="Em manutenção" value={data.counts.maintenance} />
        <StatCard label="Locações ativas" value={data.counts.activeRentals} />
        <StatCard
          label="Devoluções hoje"
          value={data.returnsToday.length}
        />
        <StatCard label="Devoluções amanhã" value={data.returnsTomorrow.length} />
        <StatCard label="Taxa de ocupação" value={`${data.occupancyRate}%`} />
        {isAdmin && (
          <StatCard
            label="Faturamento do mês"
            value={formatCurrencyBRL(data.monthlyRevenue)}
            tone="green"
          />
        )}
      </div>

      {(data.overdueReturns.length > 0 || data.expiringDocs.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.overdueReturns.length > 0 && (
            <Card className="border-ak-red/30">
              <CardHeader>
                <CardTitle className="text-ak-red-glow">Devoluções atrasadas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.overdueReturns.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/locacoes/${r.id}`}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0 hover:text-white"
                  >
                    <span>
                      {r.vehicle.brand} {r.vehicle.model} — {r.client.fullName}
                    </span>
                    <Badge tone="red">{formatDateBR(r.expectedReturnDatetime)}</Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {data.expiringDocs.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-400">Documentos/revisões vencendo</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {data.expiringDocs.map((v) => (
                  <Link
                    key={v.id}
                    href={`/admin/frota/${v.id}`}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0 hover:text-white"
                  >
                    <span>
                      {v.brand} {v.model} ({v.plate})
                    </span>
                    <Badge tone="yellow">
                      {v.ipvaExpiry ? `IPVA ${formatDateBR(v.ipvaExpiry)}` : ""}
                      {v.licensingExpiry ? ` Licenc. ${formatDateBR(v.licensingExpiry)}` : ""}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Faturamento (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueChart} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
