import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "@/components/admin/client-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";
import { auth } from "@/lib/auth";

const rentalStatusTone = { ATIVA: "red", CONCLUIDA: "green", CANCELADA: "gray" } as const;

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, session] = await Promise.all([
    prisma.client.findUnique({
      where: { id },
      include: {
        rentals: { include: { vehicle: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    auth(),
  ]);

  if (!client) notFound();
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">{client.fullName}</h1>
          <p className="text-sm text-ak-silver-dark">{client.cpf}</p>
        </div>
        {isAdmin && (
          <DeleteButton
            action={deleteClient.bind(null, client.id)}
            confirmMessage="Excluir este cliente permanentemente?"
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm action={updateClient.bind(null, client.id)} defaultValues={client} submitLabel="Salvar alterações" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de locações</CardTitle>
        </CardHeader>
        <CardContent>
          {client.rentals.length === 0 && (
            <p className="text-sm text-ak-silver-dark">Nenhuma locação registrada.</p>
          )}
          <div className="flex flex-col gap-2">
            {client.rentals.map((r) => (
              <Link
                key={r.id}
                href={`/admin/locacoes/${r.id}`}
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
                  <Badge tone={rentalStatusTone[r.status]}>{r.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
