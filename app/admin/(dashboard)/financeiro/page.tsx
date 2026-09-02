import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { FinanceEntryForm } from "@/components/admin/finance-entry-form";
import { deleteFinanceEntry } from "@/lib/actions/finance";
import { calcBalance } from "@/lib/rental-calculations";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";

export const metadata = { title: "Financeiro" };

export default async function FinanceiroPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin/dashboard");

  const [entries, vehicles, pendingRentals] = await Promise.all([
    prisma.financeEntry.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
      take: 100,
    }),
    prisma.vehicle.findMany({ orderBy: { brand: "asc" }, select: { id: true, brand: true, model: true } }),
    prisma.rental.findMany({
      where: { paymentStatus: { in: ["PARCIAL", "PENDENTE"] } },
      include: { client: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalReceita = entries.filter((e) => e.type === "RECEITA").reduce((s, e) => s + e.amount, 0);
  const totalDespesa = entries.filter((e) => e.type === "DESPESA").reduce((s, e) => s + e.amount, 0);

  const byVehicle = new Map<string, { name: string; receita: number; despesa: number }>();
  for (const e of entries) {
    if (!e.vehicleId || !e.vehicle) continue;
    const key = e.vehicleId;
    const current = byVehicle.get(key) ?? {
      name: `${e.vehicle.brand} ${e.vehicle.model}`,
      receita: 0,
      despesa: 0,
    };
    if (e.type === "RECEITA") current.receita += e.amount;
    else current.despesa += e.amount;
    byVehicle.set(key, current);
  }
  const vehicleRanking = Array.from(byVehicle.entries())
    .map(([id, v]) => ({ id, ...v, lucro: v.receita - v.despesa }))
    .sort((a, b) => b.lucro - a.lucro);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Financeiro</h1>
        <p className="text-sm text-ak-silver-dark">Receitas, despesas e contas a receber</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Receita (últimos lançamentos)" value={formatCurrencyBRL(totalReceita)} tone="green" />
        <StatCard label="Despesa (últimos lançamentos)" value={formatCurrencyBRL(totalDespesa)} tone="red" />
        <StatCard label="Resultado" value={formatCurrencyBRL(totalReceita - totalDespesa)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo lançamento</CardTitle>
        </CardHeader>
        <CardContent>
          <FinanceEntryForm vehicles={vehicles} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas a receber</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {pendingRentals.length === 0 && (
            <p className="text-sm text-ak-silver-dark">Nenhum saldo pendente.</p>
          )}
          {pendingRentals.map((r) => (
            <Link
              key={r.id}
              href={`/admin/locacoes/${r.id}`}
              className="flex items-center justify-between text-sm border-b border-white/5 pb-2 hover:text-white"
            >
              <span>
                {r.client.fullName} — {r.vehicle.brand} {r.vehicle.model}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-ak-silver-light">{formatCurrencyBRL(calcBalance(r.totalAmount, r.amountPaid))}</span>
                <Badge tone={r.paymentStatus === "PARCIAL" ? "yellow" : "red"}>{r.paymentStatus}</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento por veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ak-silver-dark text-xs uppercase border-b border-white/10">
                <th className="py-2">Veículo</th>
                <th className="py-2">Receita</th>
                <th className="py-2">Despesa</th>
                <th className="py-2">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {vehicleRanking.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="py-2 text-ak-silver-light">{v.name}</td>
                  <td className="py-2 text-emerald-400">{formatCurrencyBRL(v.receita)}</td>
                  <td className="py-2 text-ak-red-glow">{formatCurrencyBRL(v.despesa)}</td>
                  <td className="py-2 text-ak-silver-light font-medium">{formatCurrencyBRL(v.lucro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lançamentos recentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ak-silver-dark text-xs uppercase border-b border-white/10">
                <th className="py-2">Data</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Categoria</th>
                <th className="py-2">Veículo</th>
                <th className="py-2">Valor</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-white/5">
                  <td className="py-2 text-ak-silver-dark">{formatDateBR(e.date)}</td>
                  <td className="py-2">
                    <Badge tone={e.type === "RECEITA" ? "green" : "red"}>{e.type}</Badge>
                  </td>
                  <td className="py-2 text-ak-silver-light">{e.category}</td>
                  <td className="py-2 text-ak-silver-dark">
                    {e.vehicle ? `${e.vehicle.brand} ${e.vehicle.model}` : "—"}
                  </td>
                  <td className="py-2 text-ak-silver-light">{formatCurrencyBRL(e.amount)}</td>
                  <td className="py-2">
                    {!e.rentalId && (
                      <form action={deleteFinanceEntry.bind(null, e.id)}>
                        <button className="text-xs text-ak-silver-dark hover:text-ak-red-glow">Excluir</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
