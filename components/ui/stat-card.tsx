import { Card } from "./card";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  tone = "silver",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "silver" | "red" | "green";
}) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-ak-silver-dark mb-2">{label}</p>
      <p
        className={cn(
          "font-heading text-3xl font-bold",
          tone === "red" && "text-ak-red-glow",
          tone === "green" && "text-emerald-400",
          tone === "silver" && "text-ak-silver-light"
        )}
      >
        {value}
      </p>
      {hint && <p className="text-xs text-ak-silver-dark mt-1">{hint}</p>}
    </Card>
  );
}
