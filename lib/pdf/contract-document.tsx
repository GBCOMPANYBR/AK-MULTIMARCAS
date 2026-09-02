import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import path from "path";
import { styles } from "./styles";
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from "@/lib/masks/br";
import { siteConfig, vehicleCategoryLabels } from "@/lib/config";

const logoPath = path.join(process.cwd(), "public", "logo.jpg");

const fuelLabels = ["Vazio", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "Cheio"];

export interface ContractData {
  id: string;
  createdAt: Date;
  client: {
    fullName: string;
    cpf: string;
    rg: string;
    cnhNumber: string;
    cnhCategory: string;
    phone: string;
    address: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    renavam: string;
    category: string;
  };
  pickupDatetime: Date;
  expectedReturnDatetime: Date;
  kmOut: number;
  fuelOut: number;
  dailyRate: number;
  numDays: number;
  discount: number;
  surcharge: number;
  deposit: number;
  totalAmount: number;
  conditionNotes?: string | null;
}

export function ContractDocument({ rental }: { rental: ContractData }) {
  const base = rental.dailyRate * rental.numDays;

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
            <Text style={styles.docTitle}>CONTRATO DE LOCAÇÃO</Text>
            <Text style={styles.companyMeta}>Nº {rental.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.companyMeta}>Emitido em {formatDateTimeBR(rental.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Locatário</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{rental.client.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CPF</Text>
            <Text style={styles.value}>{rental.client.cpf}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RG</Text>
            <Text style={styles.value}>{rental.client.rg}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>CNH</Text>
            <Text style={styles.value}>
              {rental.client.cnhNumber} — Categoria {rental.client.cnhCategory}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{rental.client.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endereço</Text>
            <Text style={styles.value}>{rental.client.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veículo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Veículo</Text>
            <Text style={styles.value}>
              {rental.vehicle.brand} {rental.vehicle.model} {rental.vehicle.year} — {rental.vehicle.color}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placa</Text>
            <Text style={styles.value}>{rental.vehicle.plate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RENAVAM</Text>
            <Text style={styles.value}>{rental.vehicle.renavam}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Categoria</Text>
            <Text style={styles.value}>{vehicleCategoryLabels[rental.vehicle.category]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condições da locação</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Retirada</Text>
            <Text style={styles.value}>{formatDateTimeBR(rental.pickupDatetime)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Devolução prevista</Text>
            <Text style={styles.value}>{formatDateTimeBR(rental.expectedReturnDatetime)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>KM de saída</Text>
            <Text style={styles.value}>{rental.kmOut.toLocaleString("pt-BR")} km</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Combustível na saída</Text>
            <Text style={styles.value}>{fuelLabels[rental.fuelOut]}</Text>
          </View>
          {rental.conditionNotes && (
            <View style={styles.row}>
              <Text style={styles.label}>Estado do veículo</Text>
              <Text style={styles.value}>{rental.conditionNotes}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
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
            <View style={styles.tableRow}>
              <Text>Caução</Text>
              <Text>{formatCurrencyBRL(rental.deposit)}</Text>
            </View>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Valor total do contrato</Text>
            <Text style={styles.totalValue}>{formatCurrencyBRL(rental.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Condições gerais</Text>
          <Text style={styles.terms}>
            1. O LOCATÁRIO declara estar de posse de Carteira Nacional de Habilitação válida e compatível
            com a categoria do veículo locado.{"\n"}
            2. O veículo deverá ser devolvido na data e horário previstos, salvo renovação acordada
            previamente com a LOCADORA.{"\n"}
            3. Km excedente à franquia contratada, combustível devolvido em nível inferior ao da retirada
            e eventuais avarias identificadas na devolução serão cobrados conforme tabela vigente da
            LOCADORA.{"\n"}
            4. A caução informada neste contrato será devolvida ao LOCATÁRIO após a conferência do
            veículo na devolução, descontados eventuais débitos apurados.{"\n"}
            5. O LOCATÁRIO é responsável por multas de trânsito, pedágios e infrações cometidas durante
            o período de locação.
          </Text>
        </View>

        <View style={styles.signatures}>
          <Text style={styles.signatureBox}>{siteConfig.name} (Locadora)</Text>
          <Text style={styles.signatureBox}>{rental.client.fullName} (Locatário)</Text>
        </View>

        <Text style={styles.footer} fixed>
          {siteConfig.name} · {siteConfig.address} · {siteConfig.phoneDisplay} · Documento gerado em{" "}
          {formatDateBR(new Date())}
        </Text>
      </Page>
    </Document>
  );
}
