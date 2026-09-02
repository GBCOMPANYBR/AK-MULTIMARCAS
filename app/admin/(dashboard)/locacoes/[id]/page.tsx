import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { ReturnForm } from "@/components/admin/return-form";
import { ExtendForm, PaymentForm } from "@/components/admin/rental-quick-actions";
import { cancelRental } from "@/lib/actions/rentals";
import { formatCurrencyBRL, formatDateTimeBR } from "@/lib/masks/br";
import { calcBalance } from "@/lib/rental-calculations";

const statusTone = { ATIVA: "red", CONCLUIDA: "green", CANCELADA: "gray" } as const;
const paymentTone = { PAGO: "green", PARCIAL: "yellow", PENDENTE: "red" } as const;

export default async function LocacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      client: true,
      vehicle: true,
      checklists: { include: { photos: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!rental) notFound();

  const outChecklist = rental.checklists.find((c) => c.type === "SAIDA");
  const inChecklist = rental.checklists.find((c) => c.type === "DEVOLUCAO");
  const balance = calcBalance(rental.totalAmount, rental.amountPaid);
  const now = new Date();
  const overdue = rental.status === "ATIVA" && rental.expectedReturnDatetime < now;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">
            {rental.vehicle.brand} {rental.vehicle.model} — {rental.client.fullName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge tone={overdue ? "red" : statusTone[rental.status]}>
              {overdue ? "ATRASADA" : rental.status}
            </Badge>
            <Badge tone={paymentTone[rental.paymentStatus]}>{rental.paymentStatus}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/api/locacoes/${rental.id}/contrato`} variant="outline" size="sm" target="_blank">
            Contrato (PDF)
          </LinkButton>
          <LinkButton href={`/api/locacoes/${rental.id}/recibo`} variant="outline" size="sm" target="_blank">
            Recibo (PDF)
          </LinkButton>
          {rental.status === "ATIVA" && (
            <DeleteButton
              action={cancelRental.bind(null, rental.id)}
              confirmMessage="Cancelar esta locação e liberar o veículo?"
              label="Cancelar locação"
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <InfoRow label="Cliente" value={rental.client.fullName} href={`/admin/clientes/${rental.clientId}`} />
          <InfoRow label="Veículo" value={`${rental.vehicle.brand} ${rental.vehicle.model} (${rental.vehicle.plate})`} href={`/admin/frota/${rental.vehicleId}`} />
          <InfoRow label="Retirada" value={formatDateTimeBR(rental.pickupDatetime)} />
          <InfoRow label="Devolução prevista" value={formatDateTimeBR(rental.expectedReturnDatetime)} />
          {rental.actualReturnDatetime && (
            <InfoRow label="Devolução real" value={formatDateTimeBR(rental.actualReturnDatetime)} />
          )}
          <InfoRow label="KM de saída" value={`${rental.kmOut} km`} />
          {rental.kmIn != null && <InfoRow label="KM de devolução" value={`${rental.kmIn} km`} />}
          <InfoRow label="Diária" value={formatCurrencyBRL(rental.dailyRate)} />
          <InfoRow label="Diárias contratadas" value={String(rental.numDays)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <FinRow label="Base (diária × diárias)" value={rental.dailyRate * rental.numDays} />
          {rental.discount > 0 && <FinRow label="Desconto" value={-rental.discount} />}
          {rental.surcharge > 0 && <FinRow label="Acréscimo" value={rental.surcharge} />}
          {rental.kmExcessCharge > 0 && <FinRow label="KM excedente" value={rental.kmExcessCharge} />}
          {rental.extraDaysCharge > 0 && <FinRow label="Diárias extras" value={rental.extraDaysCharge} />}
          {rental.fuelCharge > 0 && <FinRow label="Combustível" value={rental.fuelCharge} />}
          {rental.damageCharge > 0 && <FinRow label="Avarias" value={rental.damageCharge} />}
          <div className="border-t border-white/10 pt-2 flex items-center justify-between font-heading">
            <span className="text-ak-silver-dark uppercase text-xs">Total</span>
            <span className="text-xl font-bold text-ak-red-glow">{formatCurrencyBRL(rental.totalAmount)}</span>
          </div>
          <FinRow label="Pago" value={rental.amountPaid} muted />
          <FinRow label="Saldo" value={balance} muted />
          <div className="text-xs text-ak-silver-dark mt-1">
            Caução: {formatCurrencyBRL(rental.deposit)} ({rental.depositMethod})
            {rental.status === "CONCLUIDA" && (
              <span> — {rental.depositReturned ? "devolvida" : "não devolvida"}</span>
            )}
          </div>

          {rental.status === "ATIVA" && balance > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <PaymentForm rentalId={rental.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {rental.status === "ATIVA" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Estender locação</CardTitle>
            </CardHeader>
            <CardContent>
              <ExtendForm rentalId={rental.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registrar devolução</CardTitle>
            </CardHeader>
            <CardContent>
              <ReturnForm
                rental={{
                  id: rental.id,
                  dailyRate: rental.dailyRate,
                  numDays: rental.numDays,
                  discount: rental.discount,
                  surcharge: rental.surcharge,
                  kmOut: rental.kmOut,
                  fuelOut: rental.fuelOut,
                  expectedReturnDatetime: rental.expectedReturnDatetime,
                  kmFranchisePerDay: rental.vehicle.kmFranchisePerDay,
                  kmExcessRate: rental.vehicle.kmExcessRate,
                }}
              />
            </CardContent>
          </Card>
        </>
      )}

      {outChecklist && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist de saída</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ak-silver-light mb-3">
              {outChecklist.conditionNotes || "Nenhuma observação registrada."}
            </p>
            <PhotoGrid photos={outChecklist.photos} />
          </CardContent>
        </Card>
      )}

      {inChecklist && (
        <Card>
          <CardHeader>
            <CardTitle>Checklist de devolução</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ak-silver-light mb-3">
              {inChecklist.conditionNotes || "Nenhuma observação registrada."}
            </p>
            <PhotoGrid photos={inChecklist.photos} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5">
      <span className="text-ak-silver-dark">{label}</span>
      {href ? (
        <Link href={href} className="text-ak-silver-light hover:text-white">
          {value}
        </Link>
      ) : (
        <span className="text-ak-silver-light">{value}</span>
      )}
    </div>
  );
}

function FinRow({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ak-silver-dark">{label}</span>
      <span className={muted ? "text-ak-silver-dark" : "text-ak-silver-light"}>
        {formatCurrencyBRL(value)}
      </span>
    </div>
  );
}

function PhotoGrid({ photos }: { photos: { id: string; url: string }[] }) {
  if (photos.length === 0) return <p className="text-xs text-ak-silver-dark">Sem fotos.</p>;
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {photos.map((p) => (
        <a key={p.id} href={p.url} target="_blank" className="relative aspect-square rounded-sm overflow-hidden border border-white/10">
          <Image src={p.url} alt="" fill className="object-cover" />
        </a>
      ))}
    </div>
  );
}
