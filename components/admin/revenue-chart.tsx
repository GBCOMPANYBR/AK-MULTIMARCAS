"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataPoint {
  label: string;
  receita: number;
  despesa: number;
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
        <XAxis dataKey="label" stroke="#6b6b6b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#6b6b6b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#161616",
            border: "1px solid #ffffff20",
            borderRadius: 4,
            color: "#e8e8e8",
          }}
          formatter={(value) =>
            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              Number(value)
            )
          }
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#c0c0c0" }} />
        <Bar dataKey="receita" name="Receita" fill="#e10600" radius={[3, 3, 0, 0]} />
        <Bar dataKey="despesa" name="Despesa" fill="#6b6b6b" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
