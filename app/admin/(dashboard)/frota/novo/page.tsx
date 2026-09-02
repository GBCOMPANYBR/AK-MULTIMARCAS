import { VehicleForm } from "@/components/admin/vehicle-form";
import { createVehicle } from "@/lib/actions/vehicles";

export const metadata = { title: "Novo veículo" };

export default function NovoVeiculoPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Novo veículo</h1>
        <p className="text-sm text-ak-silver-dark">Cadastre um veículo na frota</p>
      </div>
      <VehicleForm action={createVehicle} submitLabel="Cadastrar veículo" />
    </div>
  );
}
