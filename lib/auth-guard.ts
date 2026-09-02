import { auth } from "./auth";

export class UnauthorizedError extends Error {}

/** Garante que há uma sessão válida (staff ou cliente); usar apenas quando ambos são aceitáveis. */
async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("Não autenticado");
  return session.user;
}

/** Garante que quem está logado é um funcionário (admin ou operador); usar em toda ação administrativa. */
export async function requireStaff() {
  const user = await requireSession();
  if (user.userType !== "staff") throw new UnauthorizedError("Acesso restrito à equipe");
  return user;
}

/** Garante que o usuário logado é ADMIN; usar em ações que excluem registros ou mexem no financeiro. */
export async function requireAdmin() {
  const user = await requireStaff();
  if (user.role !== "ADMIN") throw new UnauthorizedError("Ação restrita a administradores");
  return user;
}

/** Garante que quem está logado é um cliente autenticado na área do cliente; retorna o clientId. */
export async function requireClient() {
  const user = await requireSession();
  if (user.userType !== "client") throw new UnauthorizedError("Acesso restrito à área do cliente");
  return user;
}

/**
 * Garante acesso a uma locação: staff sempre pode; cliente só se a locação for dele.
 * Usado nas rotas de geração de PDF, que são acessadas tanto pelo admin quanto pela área do cliente.
 */
export async function requireRentalAccess(rentalClientId: string) {
  const user = await requireSession();
  if (user.userType === "staff") return user;
  if (user.userType === "client" && user.id === rentalClientId) return user;
  throw new UnauthorizedError("Acesso negado a esta locação");
}
