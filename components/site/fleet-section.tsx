"use client";

import { useState } from "react";
import { VehicleCard, SiteVehicle } from "./vehicle-card";
import { vehicleCategoryLabels } from "@/lib/config";

export function FleetSection({ vehicles }: { vehicles: SiteVehicle[] }) {
  const [category, setCategory] = useState<string>("TODAS");

  const categories = ["TODAS", ...Object.keys(vehicleCategoryLabels)];
  const filtered = category === "TODAS" ? vehicles : vehicles.filter((v) => v.category === category);

  return (
    <section id="frota" className="max-w-6xl mx-auto px-4 py-20 sm:py-28">
      <div className="text-center mb-10">
        <span className="font-heading text-xs uppercase tracking-[0.3em] text-ak-red-glow">
          Nossa frota
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-ak-silver-light mt-2">
          Do popular ao luxo
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs uppercase font-heading font-semibold px-4 py-2 rounded-sm border transition-colors ${
              category === c
                ? "border-ak-red bg-ak-red/10 text-white"
                : "border-white/15 text-ak-silver-dark hover:text-ak-silver-light hover:border-white/30"
            }`}
          >
            {c === "TODAS" ? "Todas" : vehicleCategoryLabels[c]}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      ) : (
        <p className="text-center text-ak-silver-dark">Nenhum veículo nessa categoria no momento.</p>
      )}
    </section>
  );
}
