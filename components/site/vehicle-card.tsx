import Image from "next/image";
import { buildWhatsappLink, vehicleCategoryLabels } from "@/lib/config";

export interface SiteVehicle {
  id: string;
  brand: string;
  model: string;
  category: string;
  imageUrl?: string;
}

export function VehicleCard({ vehicle }: { vehicle: SiteVehicle }) {
  const message = `Olá! Tenho interesse em reservar o ${vehicle.brand} ${vehicle.model}. Ele está disponível?`;

  return (
    <div className="group bg-ak-black-card border border-white/10 rounded-md overflow-hidden hover:border-ak-red/50 transition-colors">
      <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
        {vehicle.imageUrl ? (
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-ak-silver-dark text-xs">
            Sem foto
          </div>
        )}
        <span className="absolute top-3 left-3 bg-black/70 backdrop-blur text-ak-silver-light text-[11px] uppercase font-heading px-2 py-1 rounded-sm border border-white/10">
          {vehicleCategoryLabels[vehicle.category] ?? vehicle.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-ak-silver-light">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-ak-red-glow font-heading font-bold text-sm uppercase tracking-wide mt-1">
          Consulte nossos preços
        </p>
        <a
          href={buildWhatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block text-center font-heading uppercase text-xs font-semibold bg-ak-red text-white py-3 rounded-sm hover:bg-ak-red-glow transition-colors"
        >
          Reservar
        </a>
      </div>
    </div>
  );
}
