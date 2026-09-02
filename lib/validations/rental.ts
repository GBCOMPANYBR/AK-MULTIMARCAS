import { z } from "zod";

export const paymentMethods = ["PIX", "CARTAO", "DINHEIRO"] as const;

export const newRentalSchema = z
  .object({
    clientId: z.string().optional(),
    newClientName: z.string().optional(),
    newClientCpf: z.string().optional(),
    newClientRg: z.string().optional(),
    newClientCnhNumber: z.string().optional(),
    newClientCnhCategory: z.string().optional(),
    newClientCnhExpiry: z.string().optional(),
    newClientPhone: z.string().optional(),
    newClientAddress: z.string().optional(),

    vehicleId: z.string().min(1, "Selecione um veículo"),
    pickupDatetime: z.string().min(1, "Informe a data/hora de retirada"),
    expectedReturnDatetime: z.string().min(1, "Informe a data/hora prevista de devolução"),
    kmOut: z.coerce.number().int().min(0),
    fuelOut: z.coerce.number().int().min(0).max(8),
    dailyRate: z.coerce.number().positive(),
    discount: z.coerce.number().min(0).default(0),
    surcharge: z.coerce.number().min(0).default(0),
    deposit: z.coerce.number().min(0).default(0),
    depositMethod: z.enum(paymentMethods),
    paymentMethod: z.enum(paymentMethods),
    paymentStatus: z.enum(["PAGO", "PARCIAL", "PENDENTE"]),
    amountPaid: z.coerce.number().min(0).default(0),
    conditionNotes: z.string().optional(),
  })
  .refine((data) => new Date(data.expectedReturnDatetime) > new Date(data.pickupDatetime), {
    message: "A devolução prevista deve ser depois da retirada",
    path: ["expectedReturnDatetime"],
  });

export const returnRentalSchema = z
  .object({
    actualReturnDatetime: z.string().min(1, "Informe a data/hora de devolução"),
    kmIn: z.coerce.number().int().min(0),
    fuelIn: z.coerce.number().int().min(0).max(8),
    damageCharge: z.coerce.number().min(0).default(0),
    depositReturned: z.coerce.boolean().default(false),
    additionalPayment: z.coerce.number().min(0).default(0),
    conditionNotes: z.string().optional(),
  });

export const extendRentalSchema = z.object({
  newExpectedReturnDatetime: z.string().min(1, "Informe a nova data prevista"),
});
