import { renderToBuffer } from "@react-pdf/renderer";
import { NextRequest } from "next/server";
import { getRentalHistory } from "@/lib/queries/reports";
import { requireUser } from "@/lib/auth-guard";
import { ReportDocument } from "@/lib/pdf/report-document";

export async function GET(req: NextRequest) {
  await requireUser();
  const { searchParams } = new URL(req.url);
  const rentals = await getRentalHistory({
    clientId: searchParams.get("clientId") ?? undefined,
    vehicleId: searchParams.get("vehicleId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
  });

  const buffer = await renderToBuffer(
    <ReportDocument
      rows={rentals.map((r) => ({
        clientName: r.client.fullName,
        vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
        plate: r.vehicle.plate,
        pickup: r.pickupDatetime,
        expectedReturn: r.expectedReturnDatetime,
        actualReturn: r.actualReturnDatetime,
        status: r.status,
        totalAmount: r.totalAmount,
      }))}
    />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="relatorio-locacoes.pdf"`,
    },
  });
}
