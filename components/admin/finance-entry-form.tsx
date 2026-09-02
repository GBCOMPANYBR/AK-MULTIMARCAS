"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createFinanceEntry } from "@/lib/actions/finance";

interface VehicleOption {
  id: string;
  brand: string;
  model: string;
}

const expenseCategories = ["Manutenção", "Combustível", "Lavagem", "IPVA", "Seguro", "Multa", "Outros"];
const revenueCategories = ["Locação", "Outros"];

export function FinanceEntryForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const [state, formAction, isPending] = useActionState(createFinanceEntry, undefined);

  return (
    <form action={formAction} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <Field label="Tipo">
        <Select name="type" defaultValue="DESPESA">
          <option value="DESPESA">Despesa</option>
          <option value="RECEITA">Receita</option>
        </Select>
      </Field>
      <Field label="Categoria">
        <Input name="category" list="finance-categories" required placeholder="Ex: Manutenção" />
        <datalist id="finance-categories">
          {[...expenseCategories, ...revenueCategories].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <Field label="Valor (R$)">
        <Input name="amount" type="number" step="0.01" required />
      </Field>
      <Field label="Data">
        <Input name="date" type="date" required />
      </Field>
      <Field label="Veículo (opcional)">
        <Select name="vehicleId" defaultValue="">
          <option value="">—</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model}
            </option>
          ))}
        </Select>
      </Field>
      <div className="sm:col-span-2 lg:col-span-5">
        <Field label="Descrição">
          <Textarea name="description" />
        </Field>
      </div>
      {state?.error && <p className="text-sm text-ak-red-glow lg:col-span-5">{state.error}</p>}
      <div className="lg:col-span-5">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Salvando..." : "Adicionar lançamento"}
        </Button>
      </div>
    </form>
  );
}
