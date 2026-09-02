"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { onlyDigits, isValidCPF } from "@/lib/masks/br";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

const registerSchema = z
  .object({
    cpf: z.string().refine(isValidCPF, "CPF inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export async function registerClientPassword(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const parsed = registerSchema.safeParse({
    cpf: formData.get("cpf"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const cpf = onlyDigits(parsed.data.cpf);
  const client = await prisma.client.findUnique({ where: { cpf } });

  if (!client) {
    return { error: "CPF não encontrado. Verifique se você já alugou com a AK Multimarcas ou fale com a gente." };
  }
  if (client.passwordHash) {
    return { error: "Esse CPF já tem uma senha cadastrada. Faça login ou fale com a gente para redefinir." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.client.update({ where: { id: client.id }, data: { passwordHash } });

  return { success: true };
}

export async function clientLoginAction(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("client-credentials", {
      cpf: formData.get("cpf"),
      password: formData.get("password"),
      redirectTo: "/area-do-cliente",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "CPF ou senha inválidos.";
    }
    throw error;
  }
}
