import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { ReceiptDocument } from "@/lib/pdf/receipt-document";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const rental = await prisma.rental.findUnique({
    where: { id },
    include: { client: true, vehicle: true },
  });

  if (!rental) return new Response("Locação não encontrada", { status: 404 });

  const buffer = await renderToBuffer(
    <ReceiptDocument
      rental={{
        id: rental.id,
        client: rental.client,
        vehicle: rental.vehicle,
        dailyRate: rental.dailyRate,
        numDays: rental.numDays,
        discount: rental.discount,
        surcharge: rental.surcharge,
        kmExcessCharge: rental.kmExcessCharge,
        extraDaysCharge: rental.extraDaysCharge,
        fuelCharge: rental.fuelCharge,
        damageCharge: rental.damageCharge,
        totalAmount: rental.totalAmount,
        amountPaid: rental.amountPaid,
        paymentMethod: rental.paymentMethod,
        paymentStatus: rental.paymentStatus,
        status: rental.status,
      }}
    />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${rental.id.slice(0, 8)}.pdf"`,
    },
  });
}
