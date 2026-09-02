"use client";

import { useActionState } from "react";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

type ActionState = { error?: string; success?: boolean } | undefined;
type TestimonialAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function TestimonialForm({
  action,
  defaultValues,
  submitLabel = "Adicionar depoimento",
}: {
  action: TestimonialAction;
  defaultValues?: { clientName?: string; rating?: number; text?: string; published?: boolean };
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid sm:grid-cols-4 gap-3 items-end">
      <Field label="Nome do cliente">
        <Input name="clientName" defaultValue={defaultValues?.clientName} required />
      </Field>
      <Field label="Nota">
        <Select name="rating" defaultValue={String(defaultValues?.rating ?? 5)}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} estrela{n > 1 ? "s" : ""}
            </option>
          ))}
        </Select>
      </Field>
      <label className="flex items-center gap-2 pb-2">
        <Checkbox name="published" defaultChecked={defaultValues?.published ?? true} />
        <span className="text-sm text-ak-silver-light">Publicado no site</span>
      </label>
      <div className="sm:col-span-4">
        <Field label="Depoimento">
          <Textarea name="text" defaultValue={defaultValues?.text} required />
        </Field>
      </div>
      {state?.error && <p className="text-sm text-ak-red-glow sm:col-span-4">{state.error}</p>}
      <div className="sm:col-span-4">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
