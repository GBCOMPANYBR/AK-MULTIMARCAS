import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import path from "path";
import { StyleSheet } from "@react-pdf/renderer";
import { styles, colors } from "./styles";
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from "@/lib/masks/br";
import { siteConfig, vehicleCategoryLabels } from "@/lib/config";

const logoPath = path.join(process.cwd(), "public", "logo.jpg");

const fuelLabels = ["Vazio", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "Cheio"];

const paymentMethodLabels: Record<string, string> = {
  PIX: "Pix",
  CARTAO: "Cartão",
  DINHEIRO: "Dinheiro",
};

const contractStyles = StyleSheet.create({
  letterhead: { textAlign: "center", marginBottom: 14 },
  brand: { fontSize: 20, fontFamily: "Helvetica-Bold", color: colors.black },
  brandSub: { fontSize: 9, color: colors.silver, marginTop: 2 },
  banner: {
    backgroundColor: colors.black,
    color: "#fff",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingVertical: 6,
    marginBottom: 14,
  },
  idTable: { borderTop: `1px solid ${colors.border}`, borderLeft: `1px solid ${colors.border}`, marginBottom: 16 },
  idRow: { flexDirection: "row" },
  idLabel: {
    width: "30%",
    backgroundColor: "#f2f2f2",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    padding: 5,
    borderRight: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
  },
  idValue: {
    width: "70%",
    fontSize: 8,
    padding: 5,
    borderRight: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
  },
  clause: { marginBottom: 8 },
  clauseTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3, color: colors.black },
  clauseText: { fontSize: 8.5, color: "#222", lineHeight: 1.5, textAlign: "justify" },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signBox: { width: "45%" },
  signLine: { borderTop: `1px solid #333`, paddingTop: 4, textAlign: "center", fontSize: 8 },
  signSpacer: { height: 36 },
  vistoriaTable: { borderTop: `1px solid ${colors.border}`, borderLeft: `1px solid ${colors.border}`, marginTop: 10 },
  vistoriaHeaderRow: { flexDirection: "row", backgroundColor: colors.black },
  vistoriaRow: { flexDirection: "row" },
  vistoriaCellHeader: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    padding: 5,
    borderRight: "1px solid #333",
  },
  vistoriaCell: {
    fontSize: 8,
    padding: 5,
    borderRight: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
  },
});

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
    kmFranchisePerDay: number;
    kmExcessRate: number;
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
  paymentMethod: string;
  conditionNotes?: string | null;
}

function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={contractStyles.idRow}>
      <Text style={contractStyles.idLabel}>{label}</Text>
      <Text style={contractStyles.idValue}>{value}</Text>
    </View>
  );
}

function Clause({ title, children }: { title: string; children: string }) {
  return (
    <View style={contractStyles.clause}>
      <Text style={contractStyles.clauseTitle}>{title}</Text>
      <Text style={contractStyles.clauseText}>{children}</Text>
    </View>
  );
}

export function ContractDocument({ rental }: { rental: ContractData }) {
  const extendedDateLabel = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={contractStyles.letterhead}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an HTML img */}
          <Image src={logoPath} style={{ width: 56, height: 56, alignSelf: "center", marginBottom: 6 }} />
          <Text style={contractStyles.brand}>{siteConfig.name.toUpperCase()}</Text>
          <Text style={contractStyles.brandSub}>
            {siteConfig.address} · CNPJ {siteConfig.cnpj} · {siteConfig.phoneDisplay}
          </Text>
        </View>

        <Text style={contractStyles.banner}>CONTRATO PARTICULAR DE LOCAÇÃO DE VEÍCULO</Text>

        <Text style={contractStyles.clauseTitle}>1. IDENTIFICAÇÃO DAS PARTES E DO VEÍCULO</Text>
        <View style={contractStyles.idTable}>
          <IdRow label="LOCADOR" value={siteConfig.legalName} />
          <IdRow label="CNPJ" value={siteConfig.cnpj} />
          <IdRow label="ENDEREÇO (LOCADOR)" value={siteConfig.address} />
          <IdRow label="LOCATÁRIO" value={rental.client.fullName} />
          <IdRow
            label="CPF / CNH"
            value={`${rental.client.cpf} · CNH ${rental.client.cnhNumber} (categoria ${rental.client.cnhCategory})`}
          />
          <IdRow label="ENDEREÇO (LOCATÁRIO)" value={rental.client.address} />
          <IdRow
            label="VEÍCULO / MODELO"
            value={`${rental.vehicle.brand} ${rental.vehicle.model} ${rental.vehicle.year} — ${vehicleCategoryLabels[rental.vehicle.category] ?? rental.vehicle.category}`}
          />
          <IdRow label="COR" value={rental.vehicle.color} />
          <IdRow label="PLACA" value={rental.vehicle.plate} />
          <IdRow label="INÍCIO" value={formatDateTimeBR(rental.pickupDatetime)} />
          <IdRow label="TÉRMINO" value={formatDateTimeBR(rental.expectedReturnDatetime)} />
          <IdRow
            label="VALOR DA LOCAÇÃO"
            value={`${formatCurrencyBRL(rental.totalAmount)} (${formatCurrencyBRL(rental.dailyRate)} × ${rental.numDays} diária${rental.numDays > 1 ? "s" : ""})`}
          />
          <IdRow label="CAUÇÃO" value={formatCurrencyBRL(rental.deposit)} />
          <IdRow label="PAGAMENTO" value={paymentMethodLabels[rental.paymentMethod] ?? rental.paymentMethod} />
          <IdRow
            label="FRANQUIA / PROTEÇÃO"
            value={`${rental.vehicle.kmFranchisePerDay} km/dia — excedente ${formatCurrencyBRL(rental.vehicle.kmExcessRate)}/km`}
          />
          <IdRow label="MULTA POR ATRASO" value="R$ 50,00 por dia, observada a legislação aplicável" />
        </View>

        <Clause title="2. OBJETO">
          Constitui objeto deste contrato a locação do veículo identificado acima, para uso lícito e compatível com
          sua finalidade, nas condições previstas neste instrumento e na vistoria de entrega.
        </Clause>
        <Clause title="3. PRAZO">
          A locação vigorará pelo período indicado na ficha de identificação, podendo ser prorrogada somente
          mediante concordância entre as partes. O veículo deverá ser devolvido na data ajustada, salvo prorrogação
          expressamente autorizada.
        </Clause>
        <Clause title="4. VALOR E PAGAMENTO">
          O LOCATÁRIO pagará o valor da locação na periodicidade e forma indicadas acima. O atraso caracteriza
          inadimplemento contratual, sujeitando o LOCATÁRIO à multa de R$ 50,00 por dia de atraso, sem prejuízo de
          outros encargos legalmente cabíveis e observados os limites da legislação aplicável.
        </Clause>
        <Clause title="5. CAUÇÃO">
          A caução será utilizada para garantir obrigações contratuais, despesas, danos, multas, débitos e demais
          valores comprovadamente devidos pelo LOCATÁRIO. Eventual saldo remanescente será restituído após a
          conferência final, descontados os valores legitimamente apurados.
        </Clause>
        <Clause title="6. FRANQUIA / PROTEÇÃO">
          Em caso de colisão, roubo ou furto, quando houver cobertura/proteção contratada, será observada a
          franquia e as condições previstas na respectiva apólice, contrato ou regulamento de proteção. A cobrança
          ficará limitada às obrigações efetivamente previstas e aos prejuízos atribuíveis ao LOCATÁRIO, conforme o
          caso.
        </Clause>
        <Clause title="7. GARAGEM — OBRIGAÇÃO ESSENCIAL">
          O veículo deverá permanecer guardado em garagem ou local fechado e seguro sempre que não estiver em
          uso, inclusive durante a noite, fins de semana, feriados, períodos de descanso e quando o LOCATÁRIO
          estiver ausente. É vedado deixar o veículo pernoitando ou estacionado habitualmente em via pública ou
          local desprotegido.
        </Clause>
        <Clause title="8. RESCISÃO POR DESCUMPRIMENTO DA GARAGEM">
          O descumprimento da obrigação de garagem será considerado infração contratual relevante e poderá ensejar
          a rescisão do contrato, mediante comunicação ao LOCATÁRIO e observância da legislação aplicável, sem
          prejuízo da apuração de perdas e danos eventualmente comprovados.
        </Clause>
        <Clause title="9. MAU USO E RESCISÃO">
          É vedado utilizar o veículo com negligência, imprudência ou imperícia, em corridas, competições, rachas,
          condução incompatível com as condições do veículo, transporte ilícito, sublocação não autorizada ou
          qualquer finalidade diversa da contratada. O descumprimento poderá ensejar rescisão por infração
          contratual relevante, observada a legislação aplicável.
        </Clause>
        <Clause title="10. CONSERVAÇÃO E USO">
          O LOCATÁRIO deverá conservar o veículo, seus acessórios e documentos, utilizando-os com diligência. Não
          poderá realizar alterações, adaptações ou reparos não autorizados, salvo medidas emergenciais
          indispensáveis à preservação do veículo, com comunicação ao LOCADOR assim que possível.
        </Clause>
      </Page>

      <Page size="A4" style={styles.page}>
        <Clause title="11. MULTAS, PEDÁGIOS E DESPESAS">
          Multas de trânsito, pedágios, estacionamentos, remoções, diárias de pátio e demais despesas decorrentes do
          uso do veículo durante a posse do LOCATÁRIO serão de sua responsabilidade quando comprovadamente
          relacionadas à sua utilização, sem prejuízo das regras legais de identificação e cobrança.
        </Clause>
        <Clause title="12. ACIDENTES E SINISTROS">
          Em caso de acidente, roubo, furto ou qualquer sinistro, o LOCATÁRIO deverá comunicar imediatamente o
          LOCADOR, adotar as providências de segurança necessárias, registrar a ocorrência quando cabível e
          fornecer todas as informações e documentos necessários à regulação do evento.
        </Clause>
        <Clause title="13. MANUTENÇÃO">
          Manutenções preventivas e corretivas serão realizadas conforme a responsabilidade definida entre as
          partes e conforme a natureza do serviço. O LOCATÁRIO deverá comunicar imediatamente ruídos, falhas,
          luzes de advertência ou qualquer anormalidade, evitando continuar a utilização quando isso puder agravar
          o dano.
        </Clause>
        <Clause title="14. DEVOLUÇÃO E VISTORIA">
          Na devolução, o veículo será vistoriado e comparado com o estado registrado na entrega. Danos novos,
          perdas, avarias ou despesas comprovadamente atribuíveis ao período de posse do LOCATÁRIO poderão ser
          apurados e cobrados conforme este contrato e a legislação aplicável.
        </Clause>
        <Clause title="15. COBRANÇA E FORÇA EXECUTIVA">
          Os valores líquidos, certos e exigíveis decorrentes deste contrato poderão ser cobrados pelos meios
          legalmente disponíveis. Recomenda-se a assinatura do LOCATÁRIO e de 2 (duas) testemunhas, quando se
          pretenda atender aos requisitos legais aplicáveis à formação de título executivo extrajudicial.
        </Clause>
        <Clause title="16. FORO">
          Fica eleito o foro legalmente competente para dirimir eventuais controvérsias decorrentes deste contrato,
          ressalvadas as hipóteses em que a legislação determine foro diverso ou assegure direito de escolha à
          parte protegida.
        </Clause>
        <Clause title="17. DISPOSIÇÕES FINAIS">
          As partes declaram ter lido e compreendido as condições deste instrumento, comprometendo-se a agir de
          boa-fé. Qualquer alteração deverá ser registrada por escrito. A nulidade eventual de uma cláusula não
          prejudicará as demais, que permanecerão válidas naquilo que forem juridicamente aplicáveis.
        </Clause>

        <Text style={contractStyles.clauseTitle}>18. ASSINATURAS</Text>
        <Text style={{ ...contractStyles.clauseText, marginTop: 4 }}>
          São Paulo/SP, {extendedDateLabel}.
        </Text>

        <View style={contractStyles.signRow}>
          <View style={contractStyles.signBox}>
            <View style={contractStyles.signSpacer} />
            <Text style={contractStyles.signLine}>LOCADOR — {siteConfig.legalName}</Text>
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 2 }}>CNPJ: {siteConfig.cnpj}</Text>
          </View>
          <View style={contractStyles.signBox}>
            <View style={contractStyles.signSpacer} />
            <Text style={contractStyles.signLine}>LOCATÁRIO — {rental.client.fullName}</Text>
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 2 }}>CPF: {rental.client.cpf}</Text>
          </View>
        </View>

        <View style={{ ...contractStyles.signRow, marginTop: 32 }}>
          <View style={contractStyles.signBox}>
            <View style={contractStyles.signSpacer} />
            <Text style={contractStyles.signLine}>TESTEMUNHA 1</Text>
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 2 }}>Nome / CPF:</Text>
          </View>
          <View style={contractStyles.signBox}>
            <View style={contractStyles.signSpacer} />
            <Text style={contractStyles.signLine}>TESTEMUNHA 2</Text>
            <Text style={{ fontSize: 8, textAlign: "center", marginTop: 2 }}>Nome / CPF:</Text>
          </View>
        </View>

        <Text style={styles.footer} fixed>
          {siteConfig.name} · {siteConfig.address} · CNPJ {siteConfig.cnpj} · Documento gerado em{" "}
          {formatDateBR(new Date())}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={contractStyles.clauseTitle}>ANEXO I — VISTORIA E ENTREGA DO VEÍCULO</Text>
        <Text style={{ ...contractStyles.clauseText, marginBottom: 4 }}>
          Preencher no momento da entrega e conferir na devolução.
        </Text>

        <View style={contractStyles.vistoriaTable}>
          <View style={contractStyles.vistoriaHeaderRow}>
            <Text style={{ ...contractStyles.vistoriaCellHeader, width: "34%" }}>ITEM</Text>
            <Text style={{ ...contractStyles.vistoriaCellHeader, width: "33%" }}>ENTREGA</Text>
            <Text style={{ ...contractStyles.vistoriaCellHeader, width: "33%", borderRight: "none" }}>
              DEVOLUÇÃO
            </Text>
          </View>
          <View style={contractStyles.vistoriaRow}>
            <Text style={{ ...contractStyles.vistoriaCell, width: "34%" }}>Quilometragem</Text>
            <Text style={{ ...contractStyles.vistoriaCell, width: "33%" }}>
              {rental.kmOut.toLocaleString("pt-BR")} km
            </Text>
            <Text style={{ ...contractStyles.vistoriaCell, width: "33%", borderRight: "none" }}>
              ________________
            </Text>
          </View>
          <View style={contractStyles.vistoriaRow}>
            <Text style={{ ...contractStyles.vistoriaCell, width: "34%" }}>Combustível</Text>
            <Text style={{ ...contractStyles.vistoriaCell, width: "33%" }}>{fuelLabels[rental.fuelOut]}</Text>
            <Text style={{ ...contractStyles.vistoriaCell, width: "33%", borderRight: "none" }}>
              ________________
            </Text>
          </View>
          {["Pneus / rodas", "Lataria / pintura", "Vidros / espelhos", "Interior / bancos", "Luzes / equipamentos", "Documentos / chaves"].map(
            (item) => (
              <View style={contractStyles.vistoriaRow} key={item}>
                <Text style={{ ...contractStyles.vistoriaCell, width: "34%" }}>{item}</Text>
                <Text style={{ ...contractStyles.vistoriaCell, width: "33%" }}>________________</Text>
                <Text style={{ ...contractStyles.vistoriaCell, width: "33%", borderRight: "none" }}>
                  ________________
                </Text>
              </View>
            )
          )}
          <View style={contractStyles.vistoriaRow}>
            <Text style={{ ...contractStyles.vistoriaCell, width: "34%" }}>Observações</Text>
            <Text style={{ ...contractStyles.vistoriaCell, width: "33%" }}>
              {rental.conditionNotes || "________________"}
            </Text>
            <Text style={{ ...contractStyles.vistoriaCell, width: "33%", borderRight: "none" }}>
              ________________
            </Text>
          </View>
        </View>

        <Text style={{ ...contractStyles.clauseTitle, marginTop: 16 }}>Observações gerais:</Text>
        <Text style={{ ...contractStyles.clauseText, marginTop: 20 }}>
          ________________________________________________________________________________
        </Text>
        <Text style={{ ...contractStyles.clauseText, marginTop: 16 }}>
          ________________________________________________________________________________
        </Text>

        <Text style={styles.footer} fixed>
          {siteConfig.name} · {siteConfig.address} · CNPJ {siteConfig.cnpj} · Documento gerado em{" "}
          {formatDateBR(new Date())}
        </Text>
      </Page>
    </Document>
  );
}
