import { z } from "zod";

export const financeEntrySchema = z.object({
  type: z.enum(["RECEITA", "DESPESA"]),
  category: z.string().min(2, "Informe a categoria"),
  amount: z.coerce.number().positive("Valor deve ser maior que 0"),
  date: z.string().min(1, "Informe a data"),
  description: z.string().optional(),
  vehicleId: z.string().optional(),
});

export type FinanceEntryInput = z.infer<typeof financeEntrySchema>;
