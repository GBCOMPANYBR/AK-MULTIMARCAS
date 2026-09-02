"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { financeEntrySchema } from "@/lib/validations/finance";
import { requireAdmin } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function createFinanceEntry(_prevState: unknown, formData: FormData) {
  const user = await requireAdmin();
  const parsed = financeEntrySchema.safeParse({
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    description: formData.get("description") || undefined,
    vehicleId: formData.get("vehicleId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const entry = await prisma.financeEntry.create({
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
      vehicleId: parsed.data.vehicleId || null,
    },
  });

  await logAction(user.id, "CREATE", "FinanceEntry", entry.id);
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteFinanceEntry(id: string) {
  const user = await requireAdmin();
  await prisma.financeEntry.delete({ where: { id } });
  await logAction(user.id, "DELETE", "FinanceEntry", id);
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/dashboard");
}
