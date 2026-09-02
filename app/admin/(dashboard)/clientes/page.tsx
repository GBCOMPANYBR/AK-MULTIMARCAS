import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

export const metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await prisma.client.findMany({
    where: q
      ? {
          OR: [
            { fullName: { contains: q } },
            { cpf: { contains: q.replace(/\D/g, "") } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Clientes</h1>
          <p className="text-sm text-ak-silver-dark">{clients.length} clientes cadastrados</p>
        </div>
        <LinkButton href="/admin/clientes/novo">+ Novo cliente</LinkButton>
      </div>

      <form>
        <Input name="q" defaultValue={q} placeholder="Buscar por nome ou CPF..." className="max-w-sm" />
      </form>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ak-silver-dark border-b border-white/10 text-xs uppercase">
              <th className="p-4">Nome</th>
              <th className="p-4">CPF</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">CNH</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const cnhExpired = c.cnhExpiry < now;
              return (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <Link href={`/admin/clientes/${c.id}`} className="text-ak-silver-light hover:text-white">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="p-4 text-ak-silver-dark">{c.cpf}</td>
                  <td className="p-4 text-ak-silver-dark">{c.phone}</td>
                  <td className="p-4">
                    {cnhExpired ? <Badge tone="red">CNH vencida</Badge> : <Badge tone="green">OK</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="text-center text-ak-silver-dark py-12">Nenhum cliente encontrado.</p>
        )}
      </Card>
    </div>
  );
}
