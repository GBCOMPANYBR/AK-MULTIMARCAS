import { cn } from "@/lib/cn";
import {
  forwardRef,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldBase =
  "w-full bg-black/40 border border-white/15 rounded-sm px-3 py-2 text-sm text-ak-silver-light placeholder:text-ak-silver-dark focus:outline-none focus:border-ak-red focus:ring-1 focus:ring-ak-red transition-colors disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "min-h-24", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(fieldBase, className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-ak-silver-dark uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && !error && <span className="text-xs text-ak-silver-dark">{hint}</span>}
      {error && <span className="text-xs text-ak-red-glow">{error}</span>}
    </div>
  );
}

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded-sm border border-white/20 bg-black/40 accent-ak-red",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
