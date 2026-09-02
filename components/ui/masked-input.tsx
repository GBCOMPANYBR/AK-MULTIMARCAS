"use client";

import { IMaskInput } from "react-imask";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full bg-black/40 border border-white/15 rounded-sm px-3 py-2 text-sm text-ak-silver-light placeholder:text-ak-silver-dark focus:outline-none focus:border-ak-red focus:ring-1 focus:ring-ak-red transition-colors disabled:opacity-50";

interface MaskedInputProps {
  mask: string | { mask: string }[];
  name: string;
  id?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function MaskedInput({ mask, className, ...props }: MaskedInputProps) {
  return (
    // @ts-expect-error -- react-imask types don't perfectly match React 19's HTML element props
    <IMaskInput mask={mask} className={cn(fieldBase, className)} {...props} />
  );
}

export const cpfMask = "000.000.000-00";
export const rgMask = "00.000.000-0";
export const phoneMask = [{ mask: "(00) 0000-0000" }, { mask: "(00) 00000-0000" }];
export const plateMask = "aaa-0*00";
