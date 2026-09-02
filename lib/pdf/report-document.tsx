import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./styles";
import { formatCurrencyBRL, formatDateBR } from "@/lib/masks/br";
import { siteConfig } from "@/lib/config";

export interface ReportRow {
  clientName: string;
  vehicleName: string;
  plate: string;
  pickup: Date;
  expectedReturn: Date;
  actualReturn: Date | null;
  status: string;
  totalAmount: number;
}

export function ReportDocument({ rows }: { rows: ReportRow[] }) {
  const total = rows.reduce((s, r) => s + r.totalAmount, 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{siteConfig.name}</Text>
          <View>
            <Text style={styles.docTitle}>RELATÓRIO DE LOCAÇÕES</Text>
            <Text style={styles.companyMeta}>Gerado em {formatDateBR(new Date())}</Text>
          </View>
        </View>

        <View style={{ ...styles.tableRow, fontFamily: "Helvetica-Bold", borderBottom: "1px solid #000" }}>
          <Text style={{ width: "20%" }}>Cliente</Text>
          <Text style={{ width: "20%" }}>Veículo</Text>
          <Text style={{ width: "15%" }}>Retirada</Text>
          <Text style={{ width: "15%" }}>Devolução prevista</Text>
          <Text style={{ width: "15%" }}>Devolução real</Text>
          <Text style={{ width: "8%" }}>Status</Text>
          <Text style={{ width: "7%" }}>Total</Text>
        </View>
        {rows.map((r, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ width: "20%" }}>{r.clientName}</Text>
            <Text style={{ width: "20%" }}>
              {r.vehicleName} ({r.plate})
            </Text>
            <Text style={{ width: "15%" }}>{formatDateBR(r.pickup)}</Text>
            <Text style={{ width: "15%" }}>{formatDateBR(r.expectedReturn)}</Text>
            <Text style={{ width: "15%" }}>{r.actualReturn ? formatDateBR(r.actualReturn) : "—"}</Text>
            <Text style={{ width: "8%" }}>{r.status}</Text>
            <Text style={{ width: "7%" }}>{formatCurrencyBRL(r.totalAmount)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total do período</Text>
          <Text style={styles.totalValue}>{formatCurrencyBRL(total)}</Text>
        </View>
      </Page>
    </Document>
  );
}
