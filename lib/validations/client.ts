import { z } from "zod";
import { isValidCPF } from "../masks/br";

export const clientSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo"),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  rg: z.string().min(4, "RG inválido"),
  cnhNumber: z.string().min(5, "Número da CNH inválido"),
  cnhCategory: z.string().min(1, "Informe a categoria da CNH"),
  cnhExpiry: z.string().min(1, "Informe a validade da CNH"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  address: z.string().min(5, "Informe o endereço"),
  notes: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
