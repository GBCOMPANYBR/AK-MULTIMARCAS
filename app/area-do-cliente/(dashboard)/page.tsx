import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from "@/lib/masks/br";
import { calcBalance } from "@/lib/rental-calculations";

export const metadata = { title: "Área do cliente" };

const statusTone = { ATIVA: "red", CONCLUIDA: "green", CANCELADA: "gray" } as const;

export default async function ClientPortalHomePage() {
  const session = await auth();
  const clientId = session!.user.id;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      rentals: {
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    return <p className="text-ak-silver-dark">Cliente não encontrado.</p>;
  }

  const activeRental = client.rentals.find((r) => r.status === "ATIVA");
  const history = client.rentals.filter((r) => r.id !== activeRental?.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Olá, {client.fullName.split(" ")[0]}</h1>
        <p className="text-sm text-ak-silver-dark">Acompanhe sua locação e seus dados na AK Multimarcas</p>
      </div>

      {activeRental && (
        <Card className="border-ak-red/40">
          <CardHeader>
            <CardTitle>Locação ativa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-heading font-bold text-lg text-ak-silver-light">
                  {activeRental.vehicle.brand} {activeRental.vehicle.model}
                </p>
                <p className="text-xs text-ak-silver-dark">{activeRental.vehicle.plate}</p>
              </div>
              <Badge tone={statusTone[activeRental.status]}>{activeRental.status}</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-ak-silver-dark">Retirada</span>
                <span className="text-ak-silver-light">{formatDateTimeBR(activeRental.pickupDatetime)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-ak-silver-dark">Devolução prevista</span>
                <span className="text-ak-silver-light">{formatDateTimeBR(activeRental.expectedReturnDatetime)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-ak-silver-dark">Valor total</span>
                <span className="text-ak-silver-light">{formatCurrencyBRL(activeRental.totalAmount)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-ak-silver-dark">Saldo</span>
                <span className="text-ak-silver-light">
                  {formatCurrencyBRL(calcBalance(activeRental.totalAmount, activeRental.amountPaid))}
                </span>
              </div>
            </div>
            <LinkButton href={`/area-do-cliente/locacoes/${activeRental.id}`} size="sm" className="self-start">
              Ver detalhes
            </LinkButton>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Meus dados</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <Row label="Nome" value={client.fullName} />
          <Row label="CPF" value={client.cpf} />
          <Row label="Telefone" value={client.phone} />
          <Row label="E-mail" value={client.email || "—"} />
          <Row label="CNH" value={`${client.cnhNumber} · categoria ${client.cnhCategory}`} />
          <Row label="Validade da CNH" value={formatDateBR(client.cnhExpiry)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de locações</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {history.length === 0 && (
            <p className="text-sm text-ak-silver-dark">Nenhuma outra locação registrada ainda.</p>
          )}
          {history.map((r) => (
            <Link
              key={r.id}
              href={`/area-do-cliente/locacoes/${r.id}`}
              className="flex items-center justify-between text-sm border-b border-white/5 pb-2 hover:text-white"
            >
              <div>
                <p className="text-ak-silver-light">
                  {r.vehicle.brand} {r.vehicle.model}
                </p>
                <p className="text-xs text-ak-silver-dark">{formatDateBR(r.pickupDatetime)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ak-silver-light">{formatCurrencyBRL(r.totalAmount)}</span>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5">
      <span className="text-ak-silver-dark">{label}</span>
      <span className="text-ak-silver-light">{value}</span>
    </div>
  );
}
