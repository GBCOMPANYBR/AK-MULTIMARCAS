import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import path from "path";
import { styles } from "./styles";
import { formatCurrencyBRL, formatDateTimeBR } from "@/lib/masks/br";
import { siteConfig } from "@/lib/config";

const logoPath = path.join(process.cwd(), "public", "logo.jpg");

export interface ReceiptData {
  id: string;
  client: { fullName: string; cpf: string };
  vehicle: { brand: string; model: string; plate: string };
  dailyRate: number;
  numDays: number;
  discount: number;
  surcharge: number;
  kmExcessCharge: number;
  extraDaysCharge: number;
  fuelCharge: number;
  damageCharge: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
}

export function ReceiptDocument({ rental }: { rental: ReceiptData }) {
  const base = rental.dailyRate * rental.numDays;
  const balance = Math.max(0, rental.totalAmount - rental.amountPaid);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
            <Image src={logoPath} style={styles.logo} />
            <View>
              <Text style={styles.companyName}>{siteConfig.name}</Text>
              <Text style={styles.companyMeta}>{siteConfig.address}</Text>
              <Text style={styles.companyMeta}>{siteConfig.phoneDisplay}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.docTitle}>RECIBO</Text>
            <Text style={styles.companyMeta}>Nº {rental.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.companyMeta}>Emitido em {formatDateTimeBR(new Date())}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>
              {rental.client.fullName} — {rental.client.cpf}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Veículo</Text>
            <Text style={styles.value}>
              {rental.vehicle.brand} {rental.vehicle.model} ({rental.vehicle.plate})
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Forma de pagamento</Text>
            <Text style={styles.value}>{rental.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discriminação de valores</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text>
                Diária ({formatCurrencyBRL(rental.dailyRate)} × {rental.numDays})
              </Text>
              <Text>{formatCurrencyBRL(base)}</Text>
            </View>
            {rental.discount > 0 && (
              <View style={styles.tableRow}>
                <Text>Desconto</Text>
                <Text>-{formatCurrencyBRL(rental.discount)}</Text>
              </View>
            )}
            {rental.surcharge > 0 && (
              <View style={styles.tableRow}>
                <Text>Acréscimo</Text>
                <Text>{formatCurrencyBRL(rental.surcharge)}</Text>
              </View>
            )}
            {rental.kmExcessCharge > 0 && (
              <View style={styles.tableRow}>
                <Text>KM excedente</Text>
                <Text>{formatCurrencyBRL(rental.kmExcessCharge)}</Text>
              </View>
            )}
            {rental.extraDaysCharge > 0 && (
              <View style={styles.tableRow}>
                <Text>Diárias extras</Text>
                <Text>{formatCurrencyBRL(rental.extraDaysCharge)}</Text>
              </View>
            )}
            {rental.fuelCharge > 0 && (
              <View style={styles.tableRow}>
                <Text>Combustível</Text>
                <Text>{formatCurrencyBRL(rental.fuelCharge)}</Text>
              </View>
            )}
            {rental.damageCharge > 0 && (
              <View style={styles.tableRow}>
                <Text>Avarias</Text>
                <Text>{formatCurrencyBRL(rental.damageCharge)}</Text>
              </View>
            )}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor total</Text>
            <Text style={styles.totalValue}>{formatCurrencyBRL(rental.totalAmount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Valor pago</Text>
            <Text style={styles.value}>{formatCurrencyBRL(rental.amountPaid)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Saldo</Text>
            <Text style={styles.value}>{formatCurrencyBRL(balance)}</Text>
          </View>
        </View>

        <Text style={styles.terms}>
          Recebemos de {rental.client.fullName} o valor referente à locação do veículo{" "}
          {rental.vehicle.brand} {rental.vehicle.model}, placa {rental.vehicle.plate}, conforme
          discriminado acima.
        </Text>

        <View style={styles.signatures}>
          <Text style={styles.signatureBox}>{siteConfig.name} (Locadora)</Text>
        </View>

        <Text style={styles.footer} fixed>
          {siteConfig.name} · {siteConfig.address} · {siteConfig.phoneDisplay}
        </Text>
      </Page>
    </Document>
  );
}
