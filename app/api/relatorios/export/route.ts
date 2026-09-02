import { NextRequest } from "next/server";
import { getRentalHistory } from "@/lib/queries/reports";
import { requireUser } from "@/lib/auth-guard";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";

function csvEscape(value: string) {
  if (/[",;\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

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

  const header = [
    "Cliente",
    "Veiculo",
    "Placa",
    "Retirada",
    "Devolucao prevista",
    "Devolucao real",
    "KM saida",
    "KM volta",
    "Status",
    "Pagamento",
    "Valor total",
  ];

  const rows = rentals.map((r) =>
    [
      r.client.fullName,
      `${r.vehicle.brand} ${r.vehicle.model}`,
      r.vehicle.plate,
      formatDateBR(r.pickupDatetime),
      formatDateBR(r.expectedReturnDatetime),
      r.actualReturnDatetime ? formatDateBR(r.actualReturnDatetime) : "",
      String(r.kmOut),
      r.kmIn != null ? String(r.kmIn) : "",
      r.status,
      r.paymentStatus,
      formatCurrencyBRL(r.totalAmount),
    ]
      .map((v) => csvEscape(String(v)))
      .join(";")
  );

  const csv = "﻿" + [header.join(";"), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="locacoes.csv"`,
    },
  });
}
