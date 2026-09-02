"use client";

import { useActionState } from "react";
import { Field, Input, Select, Checkbox } from "@/components/ui/form";
import { MaskedInput, plateMask } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { vehicleCategoryLabels, vehicleStatusLabels } from "@/lib/config";

type ActionState = { error?: string; success?: boolean } | undefined;
type VehicleAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface VehicleFormValues {
  brand: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  renavam: string;
  chassis: string;
  category: string;
  currentKm: number;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  deposit: number;
  kmFranchisePerDay: number;
  kmExcessRate: number;
  status: string;
  showOnSite: boolean;
  licensingExpiry?: string | Date | null;
  ipvaExpiry?: string | Date | null;
  insuranceExpiry?: string | Date | null;
}

function toDateInput(d?: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function VehicleForm({
  action,
  defaultValues,
  submitLabel = "Salvar veículo",
}: {
  action: VehicleAction;
  defaultValues?: Partial<VehicleFormValues>;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-8" encType="multipart/form-data">
      <section className="grid md:grid-cols-3 gap-4">
        <Field label="Marca">
          <Input name="brand" defaultValue={defaultValues?.brand} required />
        </Field>
        <Field label="Modelo">
          <Input name="model" defaultValue={defaultValues?.model} required />
        </Field>
        <Field label="Ano">
          <Input
            name="year"
            type="number"
            defaultValue={defaultValues?.year}
            required
          />
        </Field>
        <Field label="Cor">
          <Input name="color" defaultValue={defaultValues?.color} required />
        </Field>
        <Field label="Placa">
          <MaskedInput
            name="plate"
            mask={plateMask}
            defaultValue={defaultValues?.plate}
            required
            className="uppercase"
          />
        </Field>
        <Field label="Categoria">
          <Select name="category" defaultValue={defaultValues?.category ?? "POPULAR"} required>
            {Object.entries(vehicleCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="RENAVAM">
          <Input name="renavam" defaultValue={defaultValues?.renavam} required />
        </Field>
        <Field label="Chassi">
          <Input name="chassis" defaultValue={defaultValues?.chassis} required />
        </Field>
        <Field label="KM atual">
          <Input name="currentKm" type="number" defaultValue={defaultValues?.currentKm ?? 0} required />
        </Field>
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Valores e franquia
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Diária (R$)">
            <Input
              name="dailyRate"
              type="number"
              step="0.01"
              defaultValue={defaultValues?.dailyRate}
              required
            />
          </Field>
          <Field label="Semanal (R$)">
            <Input name="weeklyRate" type="number" step="0.01" defaultValue={defaultValues?.weeklyRate ?? 0} />
          </Field>
          <Field label="Mensal (R$)">
            <Input name="monthlyRate" type="number" step="0.01" defaultValue={defaultValues?.monthlyRate ?? 0} />
          </Field>
          <Field label="Caução (R$)">
            <Input name="deposit" type="number" step="0.01" defaultValue={defaultValues?.deposit ?? 0} />
          </Field>
          <Field label="Franquia KM/dia">
            <Input
              name="kmFranchisePerDay"
              type="number"
              defaultValue={defaultValues?.kmFranchisePerDay ?? 200}
            />
          </Field>
          <Field label="Valor KM excedente (R$)">
            <Input name="kmExcessRate" type="number" step="0.01" defaultValue={defaultValues?.kmExcessRate ?? 0} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Status e exibição
        </h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <Field label="Status">
            <Select name="status" defaultValue={defaultValues?.status ?? "DISPONIVEL"} required>
              {Object.entries(vehicleStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center gap-2 pb-2">
            <Checkbox name="showOnSite" defaultChecked={defaultValues?.showOnSite ?? false} />
            <span className="text-sm text-ak-silver-light">Exibir no site público</span>
          </label>
        </div>
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Documentos
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Vencimento licenciamento">
            <Input name="licensingExpiry" type="date" defaultValue={toDateInput(defaultValues?.licensingExpiry)} />
          </Field>
          <Field label="Vencimento IPVA">
            <Input name="ipvaExpiry" type="date" defaultValue={toDateInput(defaultValues?.ipvaExpiry)} />
          </Field>
          <Field label="Vencimento seguro">
            <Input name="insuranceExpiry" type="date" defaultValue={toDateInput(defaultValues?.insuranceExpiry)} />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Fotos
        </h3>
        <Field label="Adicionar fotos (a primeira vira a foto principal se não houver outra)">
          <input
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="text-sm text-ak-silver-light file:mr-4 file:rounded-sm file:border-0 file:bg-ak-red file:px-4 file:py-2 file:text-white file:font-heading file:uppercase file:text-xs file:cursor-pointer cursor-pointer"
          />
        </Field>
      </section>

      {state?.error && <p className="text-sm text-ak-red-glow">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Alterações salvas.</p>}

      <div>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
