import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/masks/br";
import { vehicleCategoryLabels, vehicleStatusLabels } from "@/lib/config";

export const metadata = { title: "Frota" };

const statusTone: Record<string, "green" | "red" | "yellow" | "gray"> = {
  DISPONIVEL: "green",
  ALUGADO: "red",
  MANUTENCAO: "yellow",
  INATIVO: "gray",
};

export default async function FrotaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const params = await searchParams;
  const vehicles = await prisma.vehicle.findMany({
    where: {
      category: params.category ? (params.category as never) : undefined,
      status: params.status ? (params.status as never) : undefined,
    },
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Frota</h1>
          <p className="text-sm text-ak-silver-dark">{vehicles.length} veículos cadastrados</p>
        </div>
        <LinkButton href="/admin/frota/novo">+ Novo veículo</LinkButton>
      </div>

      <form className="flex flex-wrap gap-3">
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="bg-ak-black-card border border-white/15 rounded-sm px-3 py-2 text-sm text-ak-silver-light"
        >
          <option value="">Todas categorias</option>
          {Object.entries(vehicleCategoryLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="bg-ak-black-card border border-white/15 rounded-sm px-3 py-2 text-sm text-ak-silver-light"
        >
          <option value="">Todos status</option>
          {Object.entries(vehicleStatusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button className="text-sm text-ak-silver-dark hover:text-ak-silver-light underline">
          Filtrar
        </button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vehicles.map((v) => (
          <Link key={v.id} href={`/admin/frota/${v.id}`}>
            <Card className="overflow-hidden hover:border-ak-red/50 transition-colors h-full">
              <div className="relative aspect-video bg-black/40">
                {v.images[0] ? (
                  <Image src={v.images[0].url} alt={`${v.brand} ${v.model}`} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-ak-silver-dark text-xs">
                    Sem foto
                  </div>
                )}
                <Badge tone={statusTone[v.status]} className="absolute top-2 right-2">
                  {vehicleStatusLabels[v.status]}
                </Badge>
              </div>
              <div className="p-4">
                <p className="font-heading font-semibold text-ak-silver-light">
                  {v.brand} {v.model}
                </p>
                <p className="text-xs text-ak-silver-dark mb-2">
                  {v.year} · {v.plate} · {vehicleCategoryLabels[v.category]}
                </p>
                <p className="text-ak-red-glow font-heading font-bold">
                  {formatCurrencyBRL(v.dailyRate)}
                  <span className="text-ak-silver-dark text-xs font-normal">/dia</span>
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {vehicles.length === 0 && (
        <p className="text-center text-ak-silver-dark py-12">Nenhum veículo encontrado.</p>
      )}
    </div>
  );
}
