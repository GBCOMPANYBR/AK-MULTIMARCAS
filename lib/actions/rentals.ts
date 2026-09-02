"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { newRentalSchema, returnRentalSchema, extendRentalSchema } from "@/lib/validations/rental";
import { requireUser } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";
import { saveUploadedFile } from "@/lib/uploads";
import { onlyDigits } from "@/lib/masks/br";
import { calcNumDays, calcPreviewTotal, calcReturn, calcBalance } from "@/lib/rental-calculations";

export async function createRental(_prevState: unknown, formData: FormData) {
  const user = await requireUser();

  const raw = Object.fromEntries(formData.entries());
  const parsed = newRentalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) return { error: "Veículo não encontrado" };
  if (vehicle.status !== "DISPONIVEL") return { error: "Este veículo não está disponível" };
  if (data.kmOut < vehicle.currentKm) {
    return { error: `KM de saída não pode ser menor que o KM atual do veículo (${vehicle.currentKm})` };
  }

  let clientId = data.clientId;

  if (!clientId) {
    if (!data.newClientName || !data.newClientCpf) {
      return { error: "Selecione um cliente ou preencha os dados do novo cliente" };
    }
    const cpfDigits = onlyDigits(data.newClientCpf);
    const existingClient = await prisma.client.findUnique({ where: { cpf: cpfDigits } });
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      if (
        !data.newClientRg ||
        !data.newClientCnhNumber ||
        !data.newClientCnhCategory ||
        !data.newClientCnhExpiry ||
        !data.newClientPhone ||
        !data.newClientAddress
      ) {
        return { error: "Preencha todos os dados do novo cliente" };
      }
      const newClient = await prisma.client.create({
        data: {
          fullName: data.newClientName,
          cpf: cpfDigits,
          rg: data.newClientRg,
          cnhNumber: data.newClientCnhNumber,
          cnhCategory: data.newClientCnhCategory,
          cnhExpiry: new Date(data.newClientCnhExpiry),
          phone: onlyDigits(data.newClientPhone),
          address: data.newClientAddress,
        },
      });
      clientId = newClient.id;
    }
  }

  const pickup = new Date(data.pickupDatetime);
  const expectedReturn = new Date(data.expectedReturnDatetime);
  const numDays = calcNumDays(pickup, expectedReturn);
  const totalAmount = calcPreviewTotal({
    dailyRate: data.dailyRate,
    numDays,
    discount: data.discount,
    surcharge: data.surcharge,
  });

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const photoUrls = await Promise.all(photos.map((f) => saveUploadedFile(f, "checklists")));

  const rental = await prisma.rental.create({
    data: {
      clientId,
      vehicleId: vehicle.id,
      pickupDatetime: pickup,
      expectedReturnDatetime: expectedReturn,
      kmOut: data.kmOut,
      fuelOut: data.fuelOut,
      dailyRate: data.dailyRate,
      numDays,
      discount: data.discount,
      surcharge: data.surcharge,
      deposit: data.deposit,
      depositMethod: data.depositMethod,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      amountPaid: data.amountPaid,
      totalAmount,
      status: "ATIVA",
      checklists: {
        create: [
          {
            type: "SAIDA",
            conditionNotes: data.conditionNotes,
            photos: { create: photoUrls.map((url) => ({ url })) },
          },
        ],
      },
    },
  });

  await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: "ALUGADO" } });

  await logAction(user.id, "CREATE", "Rental", rental.id);
  revalidatePath("/admin/locacoes");
  revalidatePath("/admin/frota");
  redirect(`/admin/locacoes/${rental.id}`);
}

export async function returnRental(rentalId: string, _prevState: unknown, formData: FormData) {
  const user = await requireUser();

  const raw = Object.fromEntries(formData.entries());
  const parsed = returnRentalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  const data = parsed.data;

  const rental = await prisma.rental.findUnique({ where: { id: rentalId }, include: { vehicle: true } });
  if (!rental) return { error: "Locação não encontrada" };
  if (rental.status !== "ATIVA") return { error: "Esta locação já foi concluída" };

  if (data.kmIn < rental.kmOut) {
    return { error: `KM de devolução não pode ser menor que o KM de saída (${rental.kmOut})` };
  }

  const actualReturn = new Date(data.actualReturnDatetime);
  if (actualReturn < rental.pickupDatetime) {
    return { error: "A devolução não pode ser antes da retirada" };
  }

  const result = calcReturn({
    dailyRate: rental.dailyRate,
    numDays: rental.numDays,
    discount: rental.discount,
    surcharge: rental.surcharge,
    kmOut: rental.kmOut,
    kmIn: data.kmIn,
    kmFranchisePerDay: rental.vehicle.kmFranchisePerDay,
    kmExcessRate: rental.vehicle.kmExcessRate,
    expectedReturn: rental.expectedReturnDatetime,
    actualReturn,
    fuelOut: rental.fuelOut,
    fuelIn: data.fuelIn,
    damageCharge: data.damageCharge,
  });

  const amountPaid = rental.amountPaid + data.additionalPayment;
  const balance = calcBalance(result.totalAmount, amountPaid);
  const paymentStatus = balance <= 0 ? "PAGO" : amountPaid > 0 ? "PARCIAL" : "PENDENTE";

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const photoUrls = await Promise.all(photos.map((f) => saveUploadedFile(f, "checklists")));

  await prisma.rental.update({
    where: { id: rentalId },
    data: {
      actualReturnDatetime: actualReturn,
      kmIn: data.kmIn,
      fuelIn: data.fuelIn,
      kmExcessCharge: result.kmExcessCharge,
      extraDaysCharge: result.extraDaysCharge,
      fuelCharge: result.fuelCharge,
      damageCharge: result.damageCharge,
      totalAmount: result.totalAmount,
      amountPaid,
      paymentStatus,
      depositReturned: data.depositReturned,
      status: "CONCLUIDA",
      checklists: {
        create: [
          {
            type: "DEVOLUCAO",
            conditionNotes: data.conditionNotes,
            photos: { create: photoUrls.map((url) => ({ url })) },
          },
        ],
      },
    },
  });

  await prisma.vehicle.update({
    where: { id: rental.vehicleId },
    data: { currentKm: data.kmIn, status: "DISPONIVEL" },
  });

  await prisma.financeEntry.create({
    data: {
      type: "RECEITA",
      category: "Locação",
      amount: result.totalAmount,
      date: actualReturn,
      description: `Locação concluída — ${rental.vehicle.brand} ${rental.vehicle.model}`,
      vehicleId: rental.vehicleId,
      rentalId: rental.id,
    },
  });

  await logAction(user.id, "RETURN", "Rental", rentalId);
  revalidatePath("/admin/locacoes");
  revalidatePath(`/admin/locacoes/${rentalId}`);
  revalidatePath("/admin/frota");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function extendRental(rentalId: string, _prevState: unknown, formData: FormData) {
  await requireUser();
  const parsed = extendRentalSchema.safeParse({
    newExpectedReturnDatetime: formData.get("newExpectedReturnDatetime"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data inválida" };
  }

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental || rental.status !== "ATIVA") return { error: "Locação inválida" };

  const newExpected = new Date(parsed.data.newExpectedReturnDatetime);
  if (newExpected <= rental.pickupDatetime) {
    return { error: "A nova data deve ser depois da retirada" };
  }

  const numDays = calcNumDays(rental.pickupDatetime, newExpected);
  const totalAmount = calcPreviewTotal({
    dailyRate: rental.dailyRate,
    numDays,
    discount: rental.discount,
    surcharge: rental.surcharge,
  });

  await prisma.rental.update({
    where: { id: rentalId },
    data: { expectedReturnDatetime: newExpected, numDays, totalAmount },
  });

  revalidatePath(`/admin/locacoes/${rentalId}`);
  return { success: true };
}

export async function registerPayment(rentalId: string, _prevState: unknown, formData: FormData) {
  await requireUser();
  const amount = Number(formData.get("amount"));
  if (!amount || amount <= 0) return { error: "Informe um valor válido" };

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return { error: "Locação não encontrada" };

  const amountPaid = rental.amountPaid + amount;
  const balance = calcBalance(rental.totalAmount, amountPaid);
  const paymentStatus = balance <= 0 ? "PAGO" : "PARCIAL";

  await prisma.rental.update({
    where: { id: rentalId },
    data: { amountPaid, paymentStatus },
  });

  revalidatePath(`/admin/locacoes/${rentalId}`);
  return { success: true };
}

export async function cancelRental(rentalId: string) {
  const user = await requireUser();
  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental || rental.status !== "ATIVA") return;

  await prisma.rental.update({ where: { id: rentalId }, data: { status: "CANCELADA" } });
  await prisma.vehicle.update({ where: { id: rental.vehicleId }, data: { status: "DISPONIVEL" } });

  await logAction(user.id, "CANCEL", "Rental", rentalId);
  revalidatePath("/admin/locacoes");
  revalidatePath("/admin/frota");
  redirect(`/admin/locacoes/${rentalId}`);
}
