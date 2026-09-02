"use client";

import { useActionState } from "react";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/actions/users";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="grid sm:grid-cols-4 gap-3 items-end">
      <Field label="Nome">
        <Input name="name" required />
      </Field>
      <Field label="E-mail">
        <Input name="email" type="email" required />
      </Field>
      <Field label="Senha">
        <Input name="password" type="password" required minLength={6} />
      </Field>
      <Field label="Perfil">
        <Select name="role" defaultValue="OPERATOR">
          <option value="OPERATOR">Operador</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </Field>
      {state?.error && <p className="text-sm text-ak-red-glow sm:col-span-4">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400 sm:col-span-4">Usuário criado.</p>}
      <div className="sm:col-span-4">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Criando..." : "Criar usuário"}
        </Button>
      </div>
    </form>
  );
}
