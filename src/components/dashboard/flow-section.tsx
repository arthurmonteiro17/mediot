"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyFlow } from "@/lib/types";

const FlowChart = dynamic(
  () =>
    import("@/components/dashboard/flow-chart").then((mod) => mod.FlowChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] w-full items-center justify-center text-sm text-slate-400">
        Carregando gráfico…
      </div>
    ),
  },
);

export function FlowSection({ data }: { data: DailyFlow[] }) {
  return (
    <Card className="border-slate-200/80 bg-white/85 shadow-none backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Entradas e saídas — últimos 7 dias
        </CardTitle>
        <p className="text-sm text-slate-500">
          Volume agregado a partir das movimentações RFID e registros manuais.
        </p>
      </CardHeader>
      <CardContent>
        <FlowChart data={data} />
      </CardContent>
    </Card>
  );
}
