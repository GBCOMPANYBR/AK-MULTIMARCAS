"use client";

import { useActionState, useMemo, useState } from "react";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { calcReturn } from "@/lib/rental-calculations";
import { formatCurrencyBRL } from "@/lib/masks/br";
import { returnRental } from "@/lib/actions/rentals";

const fuelLevels = ["Vazio", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8", "Cheio"];

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

interface RentalInfo {
  id: string;
  dailyRate: number;
  numDays: number;
  discount: number;
  surcharge: number;
  kmOut: number;
  fuelOut: number;
  expectedReturnDatetime: Date;
  kmFranchisePerDay: number;
  kmExcessRate: number;
}

export function ReturnForm({ rental }: { rental: RentalInfo }) {
  const action = returnRental.bind(null, rental.id);
  const [state, formAction, isPending] = useActionState(action, undefined);

  const [actualReturn, setActualReturn] = useState(toLocalInputValue(new Date()));
  const [kmIn, setKmIn] = useState(rental.kmOut);
  const [fuelIn, setFuelIn] = useState(rental.fuelOut);
  const [damageCharge, setDamageCharge] = useState(0);

  const preview = useMemo(() => {
    try {
      return calcReturn({
        dailyRate: rental.dailyRate,
        numDays: rental.numDays,
        discount: rental.discount,
        surcharge: rental.surcharge,
        kmOut: rental.kmOut,
        kmIn,
        kmFranchisePerDay: rental.kmFranchisePerDay,
        kmExcessRate: rental.kmExcessRate,
        expectedReturn: rental.expectedReturnDatetime,
        actualReturn: new Date(actualReturn),
        fuelOut: rental.fuelOut,
        fuelIn,
        damageCharge,
      });
    } catch {
      return null;
    }
  }, [rental, actualReturn, kmIn, fuelIn, damageCharge]);

  return (
    <form action={formAction} className="flex flex-col gap-6" encType="multipart/form-data">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Data/hora da devolução">
          <Input
            name="actualReturnDatetime"
            type="datetime-local"
            value={actualReturn}
            onChange={(e) => setActualReturn(e.target.value)}
            required
          />
        </Field>
        <Field label="KM de devolução" hint={`KM de saída: ${rental.kmOut}`}>
          <Input
            name="kmIn"
            type="number"
            value={kmIn}
            onChange={(e) => setKmIn(Number(e.target.value))}
            required
          />
        </Field>
        <Field label="Combustível na devolução">
          <Select name="fuelIn" value={fuelIn} onChange={(e) => setFuelIn(Number(e.target.value))} required>
            {fuelLevels.map((label, i) => (
              <option key={i} value={i}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Cobrança por avarias (R$)">
          <Input
            name="damageCharge"
            type="number"
            step="0.01"
            value={damageCharge}
            onChange={(e) => setDamageCharge(Number(e.target.value))}
          />
        </Field>
        <Field label="Pagamento adicional recebido agora (R$)">
          <Input name="additionalPayment" type="number" step="0.01" defaultValue={0} />
        </Field>
        <label className="flex items-center gap-2 pb-2 mt-6">
          <Checkbox name="depositReturned" />
          <span className="text-sm text-ak-silver-light">Caução devolvida ao cliente</span>
        </label>
      </div>

      <Field label="Checklist de devolução / novas avarias">
        <Textarea name="conditionNotes" placeholder="Descreva o estado do veículo na devolução..." />
      </Field>
      <Field label="Fotos da devolução" htmlFor="photos-in">
        <input
          id="photos-in"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          className="mt-1 text-sm text-ak-silver-light file:mr-4 file:rounded-sm file:border-0 file:bg-ak-red file:px-4 file:py-2 file:text-white file:font-heading file:uppercase file:text-xs file:cursor-pointer cursor-pointer"
        />
      </Field>

      {preview && (
        <div className="bg-black/30 border border-ak-red/30 rounded-sm p-4 flex flex-col gap-1.5 text-sm">
          <Row label="KM rodados" value={`${preview.kmDriven} km (franquia: ${preview.kmFranchiseTotal} km)`} />
          {preview.kmExcess > 0 && (
            <Row label={`KM excedente (${preview.kmExcess} km)`} value={formatCurrencyBRL(preview.kmExcessCharge)} highlight />
          )}
          {preview.extraDays > 0 && (
            <Row label={`Diárias extras (${preview.extraDays})`} value={formatCurrencyBRL(preview.extraDaysCharge)} highlight />
          )}
          {preview.fuelCharge > 0 && <Row label="Combustível faltante" value={formatCurrencyBRL(preview.fuelCharge)} highlight />}
          {preview.damageCharge > 0 && <Row label="Avarias" value={formatCurrencyBRL(preview.damageCharge)} highlight />}
          <div className="border-t border-white/10 mt-1 pt-2 flex items-center justify-between">
            <span className="font-heading uppercase text-xs text-ak-silver-dark">Total final</span>
            <span className="font-heading text-2xl font-bold text-ak-red-glow">
              {formatCurrencyBRL(preview.totalAmount)}
            </span>
          </div>
        </div>
      )}

      {state?.error && <p className="text-sm text-ak-red-glow">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Devolução registrada com sucesso.</p>}

      <div>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Registrando..." : "Confirmar devolução"}
        </Button>
      </div>
    </form>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ak-silver-dark">{label}</span>
      <span className={highlight ? "text-amber-400" : "text-ak-silver-light"}>{value}</span>
    </div>
  );
}
