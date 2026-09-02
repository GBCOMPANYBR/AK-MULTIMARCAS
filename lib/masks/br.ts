export function isValidCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const calcDigit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += digits[i] * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(9) === digits[9] && calcDigit(10) === digits[10];
}

const PLATE_OLD = /^[A-Z]{3}[0-9]{4}$/;
const PLATE_MERCOSUL = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

export function isValidPlate(raw: string): boolean {
  const plate = raw.replace(/[\s-]/g, "").toUpperCase();
  return PLATE_OLD.test(plate) || PLATE_MERCOSUL.test(plate);
}

export function formatPlate(raw: string): string {
  const plate = raw.replace(/[\s-]/g, "").toUpperCase();
  if (plate.length <= 3) return plate;
  return `${plate.slice(0, 3)}-${plate.slice(3, 7)}`;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}
