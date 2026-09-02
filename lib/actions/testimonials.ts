"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth-guard";

const testimonialSchema = z.object({
  clientName: z.string().min(2, "Informe o nome"),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(10, "O depoimento deve ter pelo menos 10 caracteres"),
  published: z.coerce.boolean(),
});

export async function createTestimonial(_prevState: unknown, formData: FormData) {
  await requireUser();
  const parsed = testimonialSchema.safeParse({
    clientName: formData.get("clientName"),
    rating: formData.get("rating"),
    text: formData.get("text"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.testimonial.create({ data: parsed.data });
  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
  return { success: true };
}

export async function updateTestimonial(id: string, _prevState: unknown, formData: FormData) {
  await requireUser();
  const parsed = testimonialSchema.safeParse({
    clientName: formData.get("clientName"),
    rating: formData.get("rating"),
    text: formData.get("text"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.testimonial.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
  redirect("/admin/depoimentos");
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
}
