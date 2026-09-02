import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateTimeBR } from "@/lib/masks/br";

export const metadata = { title: "Locações" };

const statusTone = { ATIVA: "red", CONCLUIDA: "green", CANCELADA: "gray" } as const;
const paymentTone = { PAGO: "green", PARCIAL: "yellow", PENDENTE: "red" } as const;

export default async function LocacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rentals = await prisma.rental.findMany({
    where: status ? { status: status as never } : undefined,
    include: { client: true, vehicle: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Locações</h1>
          <p className="text-sm text-ak-silver-dark">{rentals.length} locações</p>
        </div>
        <LinkButton href="/admin/locacoes/nova">+ Nova locação</LinkButton>
      </div>

      <div className="flex gap-2">
        {[
          { label: "Todas", value: "" },
          { label: "Ativas", value: "ATIVA" },
          { label: "Concluídas", value: "CONCLUIDA" },
          { label: "Canceladas", value: "CANCELADA" },
        ].map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/locacoes?status=${f.value}` : "/admin/locacoes"}
            className={`text-xs px-3 py-1.5 rounded-sm border ${
              (status ?? "") === f.value
                ? "border-ak-red bg-ak-red/10 text-white"
                : "border-white/15 text-ak-silver-dark"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ak-silver-dark border-b border-white/10 text-xs uppercase">
              <th className="p-4">Cliente</th>
              <th className="p-4">Veículo</th>
              <th className="p-4">Retirada</th>
              <th className="p-4">Devolução prevista</th>
              <th className="p-4">Total</th>
              <th className="p-4">Pagamento</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => {
              const overdue = r.status === "ATIVA" && r.expectedReturnDatetime < now;
              return (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <Link href={`/admin/locacoes/${r.id}`} className="text-ak-silver-light hover:text-white">
                      {r.client.fullName}
                    </Link>
                  </td>
                  <td className="p-4 text-ak-silver-dark">
                    {r.vehicle.brand} {r.vehicle.model}
                  </td>
                  <td className="p-4 text-ak-silver-dark">{formatDateTimeBR(r.pickupDatetime)}</td>
                  <td className="p-4">
                    <span className={overdue ? "text-ak-red-glow" : "text-ak-silver-dark"}>
                      {formatDateTimeBR(r.expectedReturnDatetime)}
                    </span>
                  </td>
                  <td className="p-4 text-ak-silver-light">{formatCurrencyBRL(r.totalAmount)}</td>
                  <td className="p-4">
                    <Badge tone={paymentTone[r.paymentStatus]}>{r.paymentStatus}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge tone={overdue ? "red" : statusTone[r.status]}>
                      {overdue ? "ATRASADA" : r.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rentals.length === 0 && (
          <p className="text-center text-ak-silver-dark py-12">Nenhuma locação encontrada.</p>
        )}
      </Card>
    </div>
  );
}
