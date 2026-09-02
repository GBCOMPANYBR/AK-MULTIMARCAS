import { FUEL_LEVEL_CHARGE } from "./config";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Número de diárias entre duas datas, sempre arredondado pra cima e no mínimo 1. */
export function calcNumDays(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / MS_PER_DAY));
}

export interface RentalQuote {
  dailyRate: number;
  numDays: number;
  discount: number;
  surcharge: number;
}

/** Valor previsto no momento da criação da locação (antes da devolução). */
export function calcPreviewTotal({
  dailyRate,
  numDays,
  discount,
  surcharge,
}: RentalQuote): number {
  const base = dailyRate * numDays;
  return round2(base - discount + surcharge);
}

export interface ReturnCalcInput {
  dailyRate: number;
  numDays: number; // diárias originalmente contratadas
  discount: number;
  surcharge: number;
  kmOut: number;
  kmIn: number;
  kmFranchisePerDay: number;
  kmExcessRate: number;
  expectedReturn: Date;
  actualReturn: Date;
  /** Nível de combustível 0-8 (0 = vazio, 8 = cheio) */
  fuelOut: number;
  fuelIn: number;
  damageCharge?: number;
}

export interface ReturnCalcResult {
  kmDriven: number;
  kmFranchiseTotal: number;
  kmExcess: number;
  kmExcessCharge: number;
  extraDays: number;
  extraDaysCharge: number;
  fuelLevelsShort: number;
  fuelCharge: number;
  damageCharge: number;
  baseTotal: number;
  totalAmount: number;
}

/** Calcula todas as cobranças da devolução. Datas de retirada não entram aqui — numDays já vem definido. */
export function calcReturn(input: ReturnCalcInput): ReturnCalcResult {
  const {
    dailyRate,
    numDays,
    discount,
    surcharge,
    kmOut,
    kmIn,
    kmFranchisePerDay,
    kmExcessRate,
    expectedReturn,
    actualReturn,
    fuelOut,
    fuelIn,
    damageCharge = 0,
  } = input;

  const kmDriven = Math.max(0, kmIn - kmOut);

  const extraDays =
    actualReturn.getTime() > expectedReturn.getTime()
      ? calcExtraDays(expectedReturn, actualReturn)
      : 0;
  const totalDaysForFranchise = numDays + extraDays;

  const kmFranchiseTotal = kmFranchisePerDay * totalDaysForFranchise;
  const kmExcess = Math.max(0, kmDriven - kmFranchiseTotal);
  const kmExcessCharge = round2(kmExcess * kmExcessRate);

  const extraDaysCharge = round2(extraDays * dailyRate);

  const fuelLevelsShort = Math.max(0, fuelOut - fuelIn);
  const fuelCharge = round2(fuelLevelsShort * FUEL_LEVEL_CHARGE);

  const baseTotal = round2(dailyRate * numDays);
  const totalAmount = round2(
    baseTotal -
      discount +
      surcharge +
      kmExcessCharge +
      extraDaysCharge +
      fuelCharge +
      damageCharge
  );

  return {
    kmDriven,
    kmFranchiseTotal,
    kmExcess,
    kmExcessCharge,
    extraDays,
    extraDaysCharge,
    fuelLevelsShort,
    fuelCharge,
    damageCharge: round2(damageCharge),
    baseTotal,
    totalAmount,
  };
}

/** Dias extras além da devolução prevista, arredondado pra cima. */
function calcExtraDays(expectedReturn: Date, actualReturn: Date): number {
  const diff = actualReturn.getTime() - expectedReturn.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_DAY);
}

export function calcBalance(totalAmount: number, amountPaid: number): number {
  return round2(totalAmount - amountPaid);
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
