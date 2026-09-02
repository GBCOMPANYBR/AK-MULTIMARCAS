"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="E-mail" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          autoFocus
        />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" required />
      </Field>
      {error && <p className="text-sm text-ak-red-glow">{error}</p>}
      <Button type="submit" size="lg" disabled={isPending} className="mt-2 w-full">
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
