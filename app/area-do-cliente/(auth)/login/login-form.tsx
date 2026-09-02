"use client";

import { useActionState } from "react";
import Link from "next/link";
import { clientLoginAction } from "@/lib/actions/client-portal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { MaskedInput, cpfMask } from "@/components/ui/masked-input";

export function ClientLoginForm() {
  const [error, formAction, isPending] = useActionState(clientLoginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="CPF" htmlFor="cpf">
        <MaskedInput id="cpf" name="cpf" mask={cpfMask} required />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" required />
      </Field>
      {error && <p className="text-sm text-ak-red-glow">{error}</p>}
      <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-xs text-ak-silver-dark">
        Ainda não tem senha?{" "}
        <Link href="/area-do-cliente/cadastro" className="text-ak-red-glow hover:underline">
          Criar acesso
        </Link>
      </p>
    </form>
  );
}
