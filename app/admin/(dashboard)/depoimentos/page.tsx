import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import { createTestimonial, deleteTestimonial } from "@/lib/actions/testimonials";
import { auth } from "@/lib/auth";

export const metadata = { title: "Depoimentos" };

export default async function DepoimentosPage() {
  const [testimonials, session] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    auth(),
  ]);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ak-silver-light">Depoimentos</h1>
        <p className="text-sm text-ak-silver-dark">Avaliações exibidas no carrossel do site</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo depoimento</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialForm action={createTestimonial} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {testimonials.map((t) => (
          <Card key={t.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-ak-silver-light">{t.clientName}</p>
                <span className="text-amber-400 text-xs">{"★".repeat(t.rating)}</span>
                <Badge tone={t.published ? "green" : "gray"}>{t.published ? "Publicado" : "Oculto"}</Badge>
              </div>
              <p className="text-sm text-ak-silver-dark">{t.text}</p>
            </div>
            {isAdmin && (
              <form action={deleteTestimonial.bind(null, t.id)}>
                <button className="text-xs text-ak-silver-dark hover:text-ak-red-glow whitespace-nowrap">
                  Excluir
                </button>
              </form>
            )}
          </Card>
        ))}
        {testimonials.length === 0 && (
          <p className="text-center text-ak-silver-dark py-8">Nenhum depoimento cadastrado.</p>
        )}
      </div>
    </div>
  );
}
