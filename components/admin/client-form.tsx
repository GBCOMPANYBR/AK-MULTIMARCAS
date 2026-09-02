"use client";

import { useActionState } from "react";
import { Field, Input, Textarea } from "@/components/ui/form";
import { MaskedInput, cpfMask, rgMask, phoneMask } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";

type ActionState = { error?: string; success?: boolean } | undefined;
type ClientAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

interface ClientFormValues {
  fullName: string;
  cpf: string;
  rg: string;
  cnhNumber: string;
  cnhCategory: string;
  cnhExpiry?: string | Date | null;
  phone: string;
  email?: string | null;
  address: string;
  notes?: string | null;
}

function toDateInput(d?: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function ClientForm({
  action,
  defaultValues,
  submitLabel = "Salvar cliente",
}: {
  action: ClientAction;
  defaultValues?: Partial<ClientFormValues>;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Nome completo">
          <Input name="fullName" defaultValue={defaultValues?.fullName} required />
        </Field>
        <Field label="CPF">
          <MaskedInput name="cpf" mask={cpfMask} defaultValue={defaultValues?.cpf} required />
        </Field>
        <Field label="RG">
          <MaskedInput name="rg" mask={rgMask} defaultValue={defaultValues?.rg} required />
        </Field>
        <Field label="Telefone/WhatsApp">
          <MaskedInput name="phone" mask={phoneMask} defaultValue={defaultValues?.phone} required />
        </Field>
        <Field label="Número da CNH">
          <Input name="cnhNumber" defaultValue={defaultValues?.cnhNumber} required />
        </Field>
        <Field label="Categoria CNH">
          <Input name="cnhCategory" defaultValue={defaultValues?.cnhCategory} required />
        </Field>
        <Field label="Validade da CNH">
          <Input
            name="cnhExpiry"
            type="date"
            defaultValue={toDateInput(defaultValues?.cnhExpiry)}
            required
          />
        </Field>
        <Field label="E-mail">
          <Input name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </Field>
      </div>
      <Field label="Endereço">
        <Input name="address" defaultValue={defaultValues?.address} required />
      </Field>
      <Field label="Observações internas">
        <Textarea name="notes" defaultValue={defaultValues?.notes ?? ""} placeholder="Ex: bom pagador, ocorrências..." />
      </Field>

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
