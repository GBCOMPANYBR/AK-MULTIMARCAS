"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations/client";
import { requireAdmin, requireStaff } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";
import { onlyDigits } from "@/lib/masks/br";

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    fullName: formData.get("fullName"),
    cpf: formData.get("cpf"),
    rg: formData.get("rg"),
    cnhNumber: formData.get("cnhNumber"),
    cnhCategory: formData.get("cnhCategory"),
    cnhExpiry: formData.get("cnhExpiry"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    address: formData.get("address"),
    notes: formData.get("notes") || "",
  });
}

export async function createClient(_prevState: unknown, formData: FormData) {
  const user = await requireStaff();
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const cpfDigits = onlyDigits(parsed.data.cpf);
  const existing = await prisma.client.findUnique({ where: { cpf: cpfDigits } });
  if (existing) {
    return { error: "Já existe um cliente cadastrado com esse CPF" };
  }

  const client = await prisma.client.create({
    data: {
      ...parsed.data,
      cpf: cpfDigits,
      phone: onlyDigits(parsed.data.phone),
      cnhExpiry: new Date(parsed.data.cnhExpiry),
      email: parsed.data.email || null,
    },
  });

  await logAction(user.id, "CREATE", "Client", client.id, client.fullName);
  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${client.id}`);
}

export async function updateClient(id: string, _prevState: unknown, formData: FormData) {
  const user = await requireStaff();
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const cpfDigits = onlyDigits(parsed.data.cpf);
  const existing = await prisma.client.findUnique({ where: { cpf: cpfDigits } });
  if (existing && existing.id !== id) {
    return { error: "Já existe um cliente cadastrado com esse CPF" };
  }

  await prisma.client.update({
    where: { id },
    data: {
      ...parsed.data,
      cpf: cpfDigits,
      phone: onlyDigits(parsed.data.phone),
      cnhExpiry: new Date(parsed.data.cnhExpiry),
      email: parsed.data.email || null,
    },
  });

  await logAction(user.id, "UPDATE", "Client", id);
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return { success: true };
}

export async function deleteClient(id: string) {
  const user = await requireAdmin();
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return;

  const rentalsCount = await prisma.rental.count({ where: { clientId: id } });
  if (rentalsCount > 0) {
    throw new Error("Não é possível excluir um cliente com histórico de locações");
  }

  await prisma.client.delete({ where: { id } });
  await logAction(user.id, "DELETE", "Client", id, client.fullName);
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function resetClientPassword(id: string) {
  const user = await requireStaff();
  await prisma.client.update({ where: { id }, data: { passwordHash: null } });
  await logAction(user.id, "RESET_PASSWORD", "Client", id);
  revalidatePath(`/admin/clientes/${id}`);
}
