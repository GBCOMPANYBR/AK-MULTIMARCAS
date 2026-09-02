import { z } from "zod";
import { isValidPlate } from "../masks/br";

export const vehicleCategories = [
  "POPULAR",
  "INTERMEDIARIO",
  "SUV",
  "PREMIUM",
  "LUXO",
] as const;

export const vehicleStatuses = [
  "DISPONIVEL",
  "ALUGADO",
  "MANUTENCAO",
  "INATIVO",
] as const;

export const vehicleSchema = z.object({
  brand: z.string().min(2, "Informe a marca"),
  model: z.string().min(1, "Informe o modelo"),
  year: z.coerce
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(2, "Informe a cor"),
  plate: z
    .string()
    .refine(isValidPlate, "Placa inválida (use o formato ABC1D23 ou ABC1234)"),
  renavam: z.string().min(9, "RENAVAM inválido").max(11),
  chassis: z.string().min(5, "Chassi inválido"),
  category: z.enum(vehicleCategories),
  currentKm: z.coerce.number().int().min(0),
  dailyRate: z.coerce.number().positive("Valor da diária deve ser maior que 0"),
  weeklyRate: z.coerce.number().min(0),
  monthlyRate: z.coerce.number().min(0),
  deposit: z.coerce.number().min(0),
  kmFranchisePerDay: z.coerce.number().int().min(0),
  kmExcessRate: z.coerce.number().min(0),
  status: z.enum(vehicleStatuses),
  showOnSite: z.boolean(),
  licensingExpiry: z.string().optional().nullable(),
  ipvaExpiry: z.string().optional().nullable(),
  insuranceExpiry: z.string().optional().nullable(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export const maintenanceRecordSchema = z.object({
  date: z.string().min(1, "Informe a data"),
  km: z.coerce.number().int().min(0),
  description: z.string().min(3, "Descreva o serviço"),
  cost: z.coerce.number().min(0),
});

export type MaintenanceRecordInput = z.infer<typeof maintenanceRecordSchema>;
