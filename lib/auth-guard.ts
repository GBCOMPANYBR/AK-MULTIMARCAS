import { auth } from "./auth";

export class UnauthorizedError extends Error {}

/** Garante que há uma sessão válida; usar dentro de server actions. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError("Não autenticado");
  return session.user;
}

/** Garante que o usuário logado é ADMIN; usar em ações que excluem registros ou mexem no financeiro. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new UnauthorizedError("Ação restrita a administradores");
  return user;
}
