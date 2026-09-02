import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "@/components/admin/user-form";
import { deleteUser } from "@/lib/actions/users";
import { formatDateTimeBR } from "@/lib/masks/br";

export const metadata = { title: "Usuários" };

export default async function UsuariosPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin/dashboard");

  const [users, logs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Usuários</h1>
        <p className="text-sm text-ak-silver-dark">Administradores e operadores do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
              <div>
                <p className="text-ak-silver-light">{u.name}</p>
                <p className="text-xs text-ak-silver-dark">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={u.role === "ADMIN" ? "silver" : "gray"}>{u.role}</Badge>
                {session.user.id !== u.id && (
                  <form action={deleteUser.bind(null, u.id)}>
                    <button className="text-xs text-ak-silver-dark hover:text-ak-red-glow">Excluir</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log de ações recentes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="text-xs text-ak-silver-dark border-b border-white/5 pb-1.5">
              <span className="text-ak-silver-light">{log.user.name}</span> {log.action.toLowerCase()} em{" "}
              {log.entityType} · {formatDateTimeBR(log.createdAt)}
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-ak-silver-dark">Nenhuma ação registrada ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
