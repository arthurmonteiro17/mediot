"use client";

import { formatDayLabel } from "@/lib/analytics";
import type { DailyFlow } from "@/lib/types";

export function FlowChart({ data }: { data: DailyFlow[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatDayLabel(d.date),
  }));

  const maxValue = Math.max(
    1,
    ...chartData.flatMap((d) => [d.entradas, d.saidas]),
  );

  const hasActivity = chartData.some((d) => d.entradas > 0 || d.saidas > 0);

  if (!hasActivity) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 text-sm text-slate-500">
        Sem movimentações nos últimos 7 dias para montar o gráfico.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-teal-700" />
          Entradas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-orange-700" />
          Saídas
        </span>
      </div>

      <div className="grid h-[220px] grid-cols-7 items-end gap-2 sm:gap-3">
        {chartData.map((day) => {
          const entradaH = Math.round((day.entradas / maxValue) * 100);
          const saidaH = Math.round((day.saidas / maxValue) * 100);
          return (
            <div key={day.date} className="flex h-full flex-col justify-end gap-2">
              <div className="flex flex-1 items-end justify-center gap-1">
                <div
                  className="w-3 rounded-t-md bg-teal-700/90 sm:w-4"
                  style={{ height: `${Math.max(entradaH, day.entradas > 0 ? 6 : 0)}%` }}
                  title={`Entradas: ${day.entradas}`}
                />
                <div
                  className="w-3 rounded-t-md bg-orange-700/90 sm:w-4"
                  style={{ height: `${Math.max(saidaH, day.saidas > 0 ? 6 : 0)}%` }}
                  title={`Saídas: ${day.saidas}`}
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium capitalize text-slate-600 sm:text-xs">
                  {day.label}
                </p>
                <p className="text-[10px] tabular-nums text-slate-400">
                  {day.entradas}/{day.saidas}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
