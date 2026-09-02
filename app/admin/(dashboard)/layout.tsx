import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-ak-black flex flex-col md:flex-row">
      <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-ak-black-soft">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Image src="/logo.jpg" alt="AK Multimarcas" width={36} height={36} className="rounded-sm" />
          <div>
            <p className="font-heading font-bold text-ak-silver-light leading-none">AK Multimarcas</p>
            <p className="text-[11px] text-ak-silver-dark uppercase tracking-wide">Gestão</p>
          </div>
        </div>
        <div className="p-3 overflow-x-auto md:overflow-visible">
          <SidebarNav isAdmin={isAdmin} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-ak-black-soft/50">
          <Link href="/" target="_blank" className="text-xs text-ak-silver-dark hover:text-ak-silver-light transition-colors">
            Ver site público ↗
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-ak-silver-light leading-none">{session?.user.name}</p>
              <p className="text-[11px] text-ak-silver-dark uppercase tracking-wide">
                {isAdmin ? "Administrador" : "Operador"}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-ak-silver-dark hover:text-ak-red-glow transition-colors uppercase font-medium"
              >
                Sair
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
