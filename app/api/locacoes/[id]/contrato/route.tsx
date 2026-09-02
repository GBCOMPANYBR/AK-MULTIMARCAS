import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireRentalAccess, UnauthorizedError } from "@/lib/auth-guard";
import { ContractDocument } from "@/lib/pdf/contract-document";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rental = await prisma.rental.findUnique({
    where: { id },
    include: { client: true, vehicle: true, checklists: true },
  });

  if (!rental) return new Response("Locação não encontrada", { status: 404 });

  try {
    await requireRentalAccess(rental.clientId);
  } catch (error) {
    if (error instanceof UnauthorizedError) return new Response("Acesso negado", { status: 403 });
    throw error;
  }

  const outChecklist = rental.checklists.find((c) => c.type === "SAIDA");

  const buffer = await renderToBuffer(
    <ContractDocument
      rental={{
        id: rental.id,
        createdAt: rental.createdAt,
        client: rental.client,
        vehicle: rental.vehicle,
        pickupDatetime: rental.pickupDatetime,
        expectedReturnDatetime: rental.expectedReturnDatetime,
        kmOut: rental.kmOut,
        fuelOut: rental.fuelOut,
        dailyRate: rental.dailyRate,
        numDays: rental.numDays,
        discount: rental.discount,
        surcharge: rental.surcharge,
        deposit: rental.deposit,
        totalAmount: rental.totalAmount,
        paymentMethod: rental.paymentMethod,
        conditionNotes: outChecklist?.conditionNotes,
      }}
    />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrato-${rental.id.slice(0, 8)}.pdf"`,
    },
  });
}
