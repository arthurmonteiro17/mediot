"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDayLabel } from "@/lib/analytics";
import type { DailyFlow } from "@/lib/types";

export function FlowChart({ data }: { data: DailyFlow[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDayLabel(d.date),
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0f766e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c2410c" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#c2410c" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke="#cbd5e1" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dbe4ee",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            labelStyle={{ color: "#0f172a", fontWeight: 600 }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 13 }}
          />
          <Area
            type="monotone"
            dataKey="entradas"
            name="Entradas"
            stroke="#0f766e"
            fill="url(#fillEntradas)"
            strokeWidth={2.2}
          />
          <Area
            type="monotone"
            dataKey="saidas"
            name="Saídas"
            stroke="#c2410c"
            fill="url(#fillSaidas)"
            strokeWidth={2.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
