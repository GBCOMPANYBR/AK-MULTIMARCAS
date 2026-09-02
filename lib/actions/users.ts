"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

const userSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "OPERATOR"]),
});

export async function createUser(_prevState: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Já existe um usuário com esse e-mail" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
    },
  });

  await logAction(admin.id, "CREATE", "User", user.id, user.email);
  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  if (admin.id === id) throw new Error("Você não pode excluir seu próprio usuário");

  await prisma.user.delete({ where: { id } });
  await logAction(admin.id, "DELETE", "User", id);
  revalidatePath("/admin/usuarios");
}
