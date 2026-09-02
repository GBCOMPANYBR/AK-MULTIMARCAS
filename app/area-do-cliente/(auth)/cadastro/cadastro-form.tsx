"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerClientPassword } from "@/lib/actions/client-portal";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { MaskedInput, cpfMask } from "@/components/ui/masked-input";

export function CadastroForm() {
  const [state, formAction, isPending] = useActionState(registerClientPassword, undefined);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-emerald-400">
          Senha criada com sucesso! Agora você já pode entrar na área do cliente.
        </p>
        <Link href="/area-do-cliente/login">
          <Button size="lg" className="w-full">
            Ir para o login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="CPF" htmlFor="cpf" hint="O mesmo CPF informado na sua locação">
        <MaskedInput id="cpf" name="cpf" mask={cpfMask} required />
      </Field>
      <Field label="Crie uma senha" htmlFor="password">
        <Input id="password" name="password" type="password" required minLength={6} />
      </Field>
      <Field label="Confirme a senha" htmlFor="confirmPassword">
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
      </Field>
      {state?.error && <p className="text-sm text-ak-red-glow">{state.error}</p>}
      <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Criando acesso..." : "Criar acesso"}
      </Button>
      <p className="text-center text-xs text-ak-silver-dark">
        Já tem senha?{" "}
        <Link href="/area-do-cliente/login" className="text-ak-red-glow hover:underline">
          Fazer login
        </Link>
      </p>
    </form>
  );
}
