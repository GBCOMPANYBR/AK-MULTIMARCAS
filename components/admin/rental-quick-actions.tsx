"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { extendRental, registerPayment } from "@/lib/actions/rentals";

export function ExtendForm({ rentalId }: { rentalId: string }) {
  const action = extendRental.bind(null, rentalId);
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <Field label="Nova data prevista de devolução">
        <Input name="newExpectedReturnDatetime" type="datetime-local" required />
      </Field>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Salvando..." : "Estender"}
      </Button>
      {state?.error && <p className="text-xs text-ak-red-glow">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400">Atualizado.</p>}
    </form>
  );
}

export function PaymentForm({ rentalId }: { rentalId: string }) {
  const action = registerPayment.bind(null, rentalId);
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <Field label="Registrar pagamento (R$)">
        <Input name="amount" type="number" step="0.01" required />
      </Field>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Salvando..." : "Registrar"}
      </Button>
      {state?.error && <p className="text-xs text-ak-red-glow">{state.error}</p>}
      {state?.success && <p className="text-xs text-emerald-400">Pagamento registrado.</p>}
    </form>
  );
}
