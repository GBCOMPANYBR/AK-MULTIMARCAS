import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { buildWhatsappLink } from "@/lib/config";

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-ak-black flex flex-col">
      <header className="border-b border-white/10 bg-ak-black-soft">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/area-do-cliente" className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="AK Multimarcas" width={36} height={36} className="rounded-sm" />
            <div>
              <p className="font-heading font-bold text-ak-silver-light leading-none">AK Multimarcas</p>
              <p className="text-[11px] text-ak-silver-dark uppercase tracking-wide">Área do cliente</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-ak-silver-light">{session?.user.name}</span>
            <a
              href={buildWhatsappLink("Olá! Preciso de ajuda com minha locação.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:underline"
            >
              Falar no WhatsApp
            </a>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/area-do-cliente/login" });
              }}
            >
              <button type="submit" className="text-xs text-ak-silver-dark hover:text-ak-red-glow uppercase font-medium">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
