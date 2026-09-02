"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { vehicleSchema, maintenanceRecordSchema } from "@/lib/validations/vehicle";
import { requireAdmin, requireStaff } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/uploads";
import { onlyDigits } from "@/lib/masks/br";

function parseVehicleForm(formData: FormData) {
  const raw = {
    brand: formData.get("brand"),
    model: formData.get("model"),
    year: formData.get("year"),
    color: formData.get("color"),
    plate: formData.get("plate"),
    renavam: onlyDigits(String(formData.get("renavam") ?? "")),
    chassis: formData.get("chassis"),
    category: formData.get("category"),
    currentKm: formData.get("currentKm"),
    dailyRate: formData.get("dailyRate"),
    weeklyRate: formData.get("weeklyRate") || 0,
    monthlyRate: formData.get("monthlyRate") || 0,
    deposit: formData.get("deposit") || 0,
    kmFranchisePerDay: formData.get("kmFranchisePerDay") || 0,
    kmExcessRate: formData.get("kmExcessRate") || 0,
    status: formData.get("status"),
    showOnSite: formData.get("showOnSite") === "on",
    licensingExpiry: formData.get("licensingExpiry") || null,
    ipvaExpiry: formData.get("ipvaExpiry") || null,
    insuranceExpiry: formData.get("insuranceExpiry") || null,
  };

  return vehicleSchema.safeParse(raw);
}

export async function createVehicle(_prevState: unknown, formData: FormData) {
  const user = await requireStaff();
  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existingPlate = await prisma.vehicle.findUnique({
    where: { plate: parsed.data.plate.replace(/[\s-]/g, "").toUpperCase() },
  });
  if (existingPlate) {
    return { error: "Já existe um veículo cadastrado com essa placa" };
  }

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const imageUrls = await Promise.all(photos.map((f) => saveUploadedFile(f, "vehicles")));

  const vehicle = await prisma.vehicle.create({
    data: {
      ...parsed.data,
      plate: parsed.data.plate.replace(/[\s-]/g, "").toUpperCase(),
      licensingExpiry: parsed.data.licensingExpiry ? new Date(parsed.data.licensingExpiry) : null,
      ipvaExpiry: parsed.data.ipvaExpiry ? new Date(parsed.data.ipvaExpiry) : null,
      insuranceExpiry: parsed.data.insuranceExpiry ? new Date(parsed.data.insuranceExpiry) : null,
      images: {
        create: imageUrls.map((url, i) => ({ url, isPrimary: i === 0, order: i })),
      },
    },
  });

  await logAction(user.id, "CREATE", "Vehicle", vehicle.id, `${vehicle.brand} ${vehicle.model}`);
  revalidatePath("/admin/frota");
  redirect(`/admin/frota/${vehicle.id}`);
}

export async function updateVehicle(id: string, _prevState: unknown, formData: FormData) {
  const user = await requireStaff();
  const parsed = parseVehicleForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const normalizedPlate = parsed.data.plate.replace(/[\s-]/g, "").toUpperCase();
  const existingPlate = await prisma.vehicle.findUnique({ where: { plate: normalizedPlate } });
  if (existingPlate && existingPlate.id !== id) {
    return { error: "Já existe um veículo cadastrado com essa placa" };
  }

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const imageUrls = await Promise.all(photos.map((f) => saveUploadedFile(f, "vehicles")));

  const hasExistingImages = await prisma.vehicleImage.count({ where: { vehicleId: id } });

  await prisma.vehicle.update({
    where: { id },
    data: {
      ...parsed.data,
      plate: normalizedPlate,
      licensingExpiry: parsed.data.licensingExpiry ? new Date(parsed.data.licensingExpiry) : null,
      ipvaExpiry: parsed.data.ipvaExpiry ? new Date(parsed.data.ipvaExpiry) : null,
      insuranceExpiry: parsed.data.insuranceExpiry ? new Date(parsed.data.insuranceExpiry) : null,
      images: imageUrls.length
        ? {
            create: imageUrls.map((url, i) => ({
              url,
              isPrimary: hasExistingImages === 0 && i === 0,
              order: hasExistingImages + i,
            })),
          }
        : undefined,
    },
  });

  await logAction(user.id, "UPDATE", "Vehicle", id);
  revalidatePath("/admin/frota");
  revalidatePath(`/admin/frota/${id}`);
  return { success: true };
}

export async function deleteVehicle(id: string) {
  const user = await requireAdmin();
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) return;

  const activeRentals = await prisma.rental.count({ where: { vehicleId: id, status: "ATIVA" } });
  if (activeRentals > 0) {
    throw new Error("Não é possível excluir um veículo com locação ativa");
  }

  await prisma.vehicle.delete({ where: { id } });
  await logAction(user.id, "DELETE", "Vehicle", id, `${vehicle.brand} ${vehicle.model}`);
  revalidatePath("/admin/frota");
  redirect("/admin/frota");
}

export async function setPrimaryImage(vehicleId: string, imageId: string) {
  await requireStaff();
  await prisma.$transaction([
    prisma.vehicleImage.updateMany({ where: { vehicleId }, data: { isPrimary: false } }),
    prisma.vehicleImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
  revalidatePath(`/admin/frota/${vehicleId}`);
}

export async function deleteVehicleImage(vehicleId: string, imageId: string) {
  await requireStaff();
  const image = await prisma.vehicleImage.findUnique({ where: { id: imageId } });
  if (!image) return;
  await prisma.vehicleImage.delete({ where: { id: imageId } });
  await deleteUploadedFile(image.url);

  if (image.isPrimary) {
    const next = await prisma.vehicleImage.findFirst({
      where: { vehicleId },
      orderBy: { order: "asc" },
    });
    if (next) {
      await prisma.vehicleImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }
  revalidatePath(`/admin/frota/${vehicleId}`);
}

export async function addMaintenanceRecord(vehicleId: string, _prevState: unknown, formData: FormData) {
  await requireStaff();
  const parsed = maintenanceRecordSchema.safeParse({
    date: formData.get("date"),
    km: formData.get("km"),
    description: formData.get("description"),
    cost: formData.get("cost"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.maintenanceRecord.create({
    data: {
      vehicleId,
      date: new Date(parsed.data.date),
      km: parsed.data.km,
      description: parsed.data.description,
      cost: parsed.data.cost,
    },
  });

  revalidatePath(`/admin/frota/${vehicleId}`);
  return { success: true };
}
