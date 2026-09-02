import { notFound } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { formatCurrencyBRL, formatDateTimeBR } from "@/lib/masks/br";
import { calcBalance } from "@/lib/rental-calculations";

const statusTone = { ATIVA: "red", CONCLUIDA: "green", CANCELADA: "gray" } as const;

export default async function ClientRentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      vehicle: true,
      checklists: { include: { photos: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!rental || rental.clientId !== session!.user.id) notFound();

  const outChecklist = rental.checklists.find((c) => c.type === "SAIDA");
  const inChecklist = rental.checklists.find((c) => c.type === "DEVOLUCAO");
  const balance = calcBalance(rental.totalAmount, rental.amountPaid);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">
            {rental.vehicle.brand} {rental.vehicle.model}
          </h1>
          <Badge tone={statusTone[rental.status]} className="mt-1">
            {rental.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/api/locacoes/${rental.id}/contrato`} variant="outline" size="sm" target="_blank">
            Contrato (PDF)
          </LinkButton>
          <LinkButton href={`/api/locacoes/${rental.id}/recibo`} variant="outline" size="sm" target="_blank">
            Recibo (PDF)
          </LinkButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <Row label="Veículo" value={`${rental.vehicle.brand} ${rental.vehicle.model} (${rental.vehicle.plate})`} />
          <Row label="Retirada" value={formatDateTimeBR(rental.pickupDatetime)} />
          <Row label="Devolução prevista" value={formatDateTimeBR(rental.expectedReturnDatetime)} />
          {rental.actualReturnDatetime && (
            <Row label="Devolução real" value={formatDateTimeBR(rental.actualReturnDatetime)} />
          )}
          <Row label="KM de saída" value={`${rental.kmOut} km`} />
          {rental.kmIn != null && <Row label="KM de devolução" value={`${rental.kmIn} km`} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Row label="Diária" value={formatCurrencyBRL(rental.dailyRate)} />
          <Row label="Diárias contratadas" value={String(rental.numDays)} />
          {rental.kmExcessCharge > 0 && <Row label="KM excedente" value={formatCurrencyBRL(rental.kmExcessCharge)} />}
          {rental.extraDaysCharge > 0 && (
            <Row label="Diárias extras" value={formatCurrencyBRL(rental.extraDaysCharge)} />
          )}
          {rental.fuelCharge > 0 && <Row label="Combustível" value={formatCurrencyBRL(rental.fuelCharge)} />}
          {rental.damageCharge > 0 && <Row label="Avarias" value={formatCurrencyBRL(rental.damageCharge)} />}
          <div className="border-t border-white/10 pt-2 flex items-center justify-between font-heading">
            <span className="text-ak-silver-dark uppercase text-xs">Total</span>
            <span className="text-xl font-bold text-ak-red-glow">{formatCurrencyBRL(rental.totalAmount)}</span>
          </div>
          <Row label="Pago" value={formatCurrencyBRL(rental.amountPaid)} />
          <Row label="Saldo" value={formatCurrencyBRL(balance)} />
          <p className="text-xs text-ak-silver-dark mt-1">
            Caução: {formatCurrencyBRL(rental.deposit)}
            {rental.status === "CONCLUIDA" && (
              <span> — {rental.depositReturned ? "devolvida" : "ainda não devolvida"}</span>
            )}
          </p>
        </CardContent>
      </Card>

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-1.5">
      <span className="text-ak-silver-dark">{label}</span>
      <span className="text-ak-silver-light">{value}</span>
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
