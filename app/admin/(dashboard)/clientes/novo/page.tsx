import { ClientForm } from "@/components/admin/client-form";
import { createClient } from "@/lib/actions/clients";

export const metadata = { title: "Novo cliente" };

export default function NovoClientePage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Novo cliente</h1>
        <p className="text-sm text-ak-silver-dark">Cadastre um novo cliente</p>
      </div>
      <ClientForm action={createClient} submitLabel="Cadastrar cliente" />
    </div>
  );
}
