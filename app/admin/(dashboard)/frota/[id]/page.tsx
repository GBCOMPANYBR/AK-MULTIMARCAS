import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VehicleForm } from "@/components/admin/vehicle-form";
import { MaintenanceForm } from "@/components/admin/maintenance-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateVehicle,
  deleteVehicle,
  setPrimaryImage,
  deleteVehicleImage,
} from "@/lib/actions/vehicles";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";
import { auth } from "@/lib/auth";

export default async function VeiculoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, session] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        maintenanceRecords: { orderBy: { date: "desc" } },
      },
    }),
    auth(),
  ]);

  if (!vehicle) notFound();
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ak-silver-light">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="text-sm text-ak-silver-dark">{vehicle.plate}</p>
        </div>
        {isAdmin && (
          <DeleteButton
            action={deleteVehicle.bind(null, vehicle.id)}
            confirmMessage="Excluir este veículo permanentemente?"
          />
        )}
      </div>

      {vehicle.images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {vehicle.images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-sm overflow-hidden border border-white/10 group">
              <Image src={img.url} alt="" fill className="object-cover" />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-ak-red text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                  Principal
                </span>
              )}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                {!img.isPrimary && (
                  <form action={setPrimaryImage.bind(null, vehicle.id, img.id)}>
                    <button className="text-[10px] text-ak-silver-light hover:text-white underline">
                      Tornar principal
                    </button>
                  </form>
                )}
                <form action={deleteVehicleImage.bind(null, vehicle.id, img.id)}>
                  <button className="text-[10px] text-ak-red-glow hover:text-red-300 underline">
                    Remover
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados do veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            action={updateVehicle.bind(null, vehicle.id)}
            defaultValues={{
              ...vehicle,
              category: vehicle.category,
              status: vehicle.status,
              licensingExpiry: vehicle.licensingExpiry,
              ipvaExpiry: vehicle.ipvaExpiry,
              insuranceExpiry: vehicle.insuranceExpiry,
            }}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de manutenções</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {vehicle.maintenanceRecords.length > 0 && (
            <div className="flex flex-col gap-2">
              {vehicle.maintenanceRecords.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between text-sm border-b border-white/5 pb-2"
                >
                  <div>
                    <p className="text-ak-silver-light">{m.description}</p>
                    <p className="text-xs text-ak-silver-dark">
                      {formatDateBR(m.date)} · {m.km.toLocaleString("pt-BR")} km
                    </p>
                  </div>
                  <p className="text-ak-silver-light">{formatCurrencyBRL(m.cost)}</p>
                </div>
              ))}
            </div>
          )}
          <MaintenanceForm vehicleId={vehicle.id} />
        </CardContent>
      </Card>
    </div>
  );
}
