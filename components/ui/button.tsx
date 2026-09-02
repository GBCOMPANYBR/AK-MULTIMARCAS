import { cn } from "@/lib/cn";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-heading font-semibold tracking-wide uppercase transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ak-red text-white hover:bg-ak-red-glow shadow-[0_0_20px_-4px_rgba(225,6,0,0.6)] hover:shadow-[0_0_28px_-2px_rgba(255,45,33,0.8)]",
  outline:
    "border border-ak-silver-dark text-ak-silver-light hover:border-ak-red hover:text-white bg-transparent",
  ghost: "text-ak-silver-light hover:bg-white/5",
  danger: "bg-red-900 text-white hover:bg-red-800",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], "rounded-sm", className)}
      {...props}
    />
  );
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  target,
  rel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={cn(base, variants[variant], sizes[size], "rounded-sm", className)}
    >
      {children}
    </Link>
  );
}
