import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata = { title: "Login administrativo" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ak-black px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-ak-red/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-ak-silver/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.jpg" alt="AK Multimarcas" width={96} height={96} className="rounded-md" />
        </div>
        <div className="bg-ak-black-card border border-white/10 rounded-md p-8">
          <h1 className="font-heading text-2xl font-bold text-center text-ak-silver-light mb-1">
            Painel Administrativo
          </h1>
          <p className="text-center text-sm text-ak-silver-dark mb-6">
            Acesse com suas credenciais
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
