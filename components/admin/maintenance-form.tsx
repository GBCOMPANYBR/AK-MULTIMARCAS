"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { addMaintenanceRecord } from "@/lib/actions/vehicles";

export function MaintenanceForm({ vehicleId }: { vehicleId: string }) {
  const action = addMaintenanceRecord.bind(null, vehicleId);
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid sm:grid-cols-4 gap-3 items-end">
      <Field label="Data">
        <Input name="date" type="date" required />
      </Field>
      <Field label="KM">
        <Input name="km" type="number" required />
      </Field>
      <Field label="Custo (R$)">
        <Input name="cost" type="number" step="0.01" required />
      </Field>
      <div className="sm:col-span-4">
        <Field label="Descrição do serviço">
          <Textarea name="description" required />
        </Field>
      </div>
      {state?.error && <p className="text-sm text-ak-red-glow sm:col-span-4">{state.error}</p>}
      <div className="sm:col-span-4">
        <Button type="submit" size="sm" variant="outline" disabled={isPending}>
          {isPending ? "Salvando..." : "Adicionar manutenção"}
        </Button>
      </div>
    </form>
  );
}
