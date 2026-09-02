"use client";

import { useActionState, useMemo, useState } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { MaskedInput, cpfMask, rgMask, phoneMask } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { calcNumDays, calcPreviewTotal } from "@/lib/rental-calculations";
import { formatCurrencyBRL } from "@/lib/masks/br";
import { createRental } from "@/lib/actions/rentals";

interface ClientOption {
  id: string;
  fullName: string;
  cpf: string;
}

interface VehicleOption {
  id: string;
  brand: string;
  model: string;
  plate: string;
  currentKm: number;
  dailyRate: number;
  deposit: number;
  kmFranchisePerDay: number;
}

const fuelLevels = ["Vazio", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "Cheio"];

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export function RentalForm({
  clients,
  vehicles,
}: {
  clients: ClientOption[];
  vehicles: VehicleOption[];
}) {
  const [state, formAction, isPending] = useActionState(createRental, undefined);

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id ?? "");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  const now = new Date();
  const [pickup, setPickup] = useState(toLocalInputValue(now));
  const [expectedReturn, setExpectedReturn] = useState(
    toLocalInputValue(new Date(now.getTime() + 86400000))
  );
  const [dailyRate, setDailyRate] = useState(selectedVehicle?.dailyRate ?? 0);
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);

  const numDays = useMemo(() => {
    try {
      return calcNumDays(new Date(pickup), new Date(expectedReturn));
    } catch {
      return 1;
    }
  }, [pickup, expectedReturn]);

  const previewTotal = useMemo(
    () => calcPreviewTotal({ dailyRate, numDays, discount, surcharge }),
    [dailyRate, numDays, discount, surcharge]
  );

  return (
    <form action={formAction} className="flex flex-col gap-8" encType="multipart/form-data">
      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">Cliente</h3>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setClientMode("existing")}
            className={`text-xs px-3 py-1.5 rounded-sm border ${
              clientMode === "existing"
                ? "border-ak-red bg-ak-red/10 text-white"
                : "border-white/15 text-ak-silver-dark"
            }`}
          >
            Cliente existente
          </button>
          <button
            type="button"
            onClick={() => setClientMode("new")}
            className={`text-xs px-3 py-1.5 rounded-sm border ${
              clientMode === "new"
                ? "border-ak-red bg-ak-red/10 text-white"
                : "border-white/15 text-ak-silver-dark"
            }`}
          >
            Cadastrar novo cliente
          </button>
        </div>

        {clientMode === "existing" ? (
          <Field label="Selecione o cliente">
            <Select name="clientId" required={clientMode === "existing"}>
              <option value="">Selecione...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.cpf}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nome completo">
              <Input name="newClientName" required={clientMode === "new"} />
            </Field>
            <Field label="CPF">
              <MaskedInput name="newClientCpf" mask={cpfMask} required={clientMode === "new"} />
            </Field>
            <Field label="RG">
              <MaskedInput name="newClientRg" mask={rgMask} required={clientMode === "new"} />
            </Field>
            <Field label="Telefone/WhatsApp">
              <MaskedInput name="newClientPhone" mask={phoneMask} required={clientMode === "new"} />
            </Field>
            <Field label="Número da CNH">
              <Input name="newClientCnhNumber" required={clientMode === "new"} />
            </Field>
            <Field label="Categoria CNH">
              <Input name="newClientCnhCategory" required={clientMode === "new"} />
            </Field>
            <Field label="Validade da CNH">
              <Input name="newClientCnhExpiry" type="date" required={clientMode === "new"} />
            </Field>
            <Field label="Endereço">
              <Input name="newClientAddress" required={clientMode === "new"} />
            </Field>
          </div>
        )}
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Veículo e período
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Veículo disponível">
            <Select
              name="vehicleId"
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                const v = vehicles.find((veh) => veh.id === e.target.value);
                if (v) setDailyRate(v.dailyRate);
              }}
              required
            >
              <option value="">Selecione...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} — {v.plate}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="KM de saída" hint={selectedVehicle ? `KM atual: ${selectedVehicle.currentKm}` : undefined}>
            <Input name="kmOut" type="number" defaultValue={selectedVehicle?.currentKm ?? 0} required />
          </Field>
          <Field label="Combustível na saída">
            <Select name="fuelOut" defaultValue="8" required>
              {fuelLevels.map((label, i) => (
                <option key={i} value={i}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Retirada">
            <Input
              name="pickupDatetime"
              type="datetime-local"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
            />
          </Field>
          <Field label="Devolução prevista">
            <Input
              name="expectedReturnDatetime"
              type="datetime-local"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              required
            />
          </Field>
          <Field label="Diárias calculadas">
            <Input value={numDays} disabled />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Valores
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Valor da diária (R$)">
            <Input
              name="dailyRate"
              type="number"
              step="0.01"
              value={dailyRate}
              onChange={(e) => setDailyRate(Number(e.target.value))}
              required
            />
          </Field>
          <Field label="Desconto (R$)">
            <Input
              name="discount"
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </Field>
          <Field label="Acréscimo (R$)">
            <Input
              name="surcharge"
              type="number"
              step="0.01"
              value={surcharge}
              onChange={(e) => setSurcharge(Number(e.target.value))}
            />
          </Field>
          <Field label="Caução (R$)">
            <Input name="deposit" type="number" step="0.01" defaultValue={selectedVehicle?.deposit ?? 0} />
          </Field>
          <Field label="Forma da caução">
            <Select name="depositMethod" defaultValue="PIX">
              <option value="PIX">Pix</option>
              <option value="CARTAO">Cartão</option>
              <option value="DINHEIRO">Dinheiro</option>
            </Select>
          </Field>
          <Field label="Forma de pagamento">
            <Select name="paymentMethod" defaultValue="PIX">
              <option value="PIX">Pix</option>
              <option value="CARTAO">Cartão</option>
              <option value="DINHEIRO">Dinheiro</option>
            </Select>
          </Field>
          <Field label="Status do pagamento">
            <Select name="paymentStatus" defaultValue="PENDENTE">
              <option value="PAGO">Pago</option>
              <option value="PARCIAL">Parcial</option>
              <option value="PENDENTE">Pendente</option>
            </Select>
          </Field>
          <Field label="Valor já pago (R$)">
            <Input name="amountPaid" type="number" step="0.01" defaultValue={0} />
          </Field>
        </div>

        <div className="mt-4 bg-black/30 border border-ak-red/30 rounded-sm p-4 flex items-center justify-between">
          <span className="text-sm text-ak-silver-dark">Valor total previsto ({numDays} diária{numDays > 1 ? "s" : ""})</span>
          <span className="font-heading text-2xl font-bold text-ak-red-glow">
            {formatCurrencyBRL(previewTotal)}
          </span>
        </div>
      </section>

      <section>
        <h3 className="font-heading text-sm uppercase tracking-wide text-ak-silver-dark mb-3">
          Checklist de saída
        </h3>
        <Field label="Estado do veículo / avarias existentes">
          <Textarea name="conditionNotes" placeholder="Ex: sem avarias, pequeno risco no para-choque..." />
        </Field>
        <Field label="Fotos do checklist" htmlFor="photos-out">
          <input
            id="photos-out"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="mt-1 text-sm text-ak-silver-light file:mr-4 file:rounded-sm file:border-0 file:bg-ak-red file:px-4 file:py-2 file:text-white file:font-heading file:uppercase file:text-xs file:cursor-pointer cursor-pointer"
          />
        </Field>
      </section>

      {state?.error && <p className="text-sm text-ak-red-glow">{state.error}</p>}

      <div>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Criando locação..." : "Confirmar locação"}
        </Button>
      </div>
    </form>
  );
}
