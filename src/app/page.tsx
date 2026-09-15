"use client";

import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { FlowSection } from "@/components/dashboard/flow-section";
import { ForecastPanel } from "@/components/dashboard/forecast-panel";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { MovementsTable } from "@/components/dashboard/movements-table";
import { ProductsTable } from "@/components/dashboard/products-table";
import {
  getAlerts,
  getDailyFlow,
  getDashboardStats,
  getForecasts,
  getSortedMovements,
} from "@/lib/analytics";
import { useMediot } from "@/lib/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Boxes } from "lucide-react";

export default function DashboardPage() {
  const { products, movements, hospital } = useMediot();
  const stats = getDashboardStats(products);
  const flow = getDailyFlow(movements, 7, hospital.lastSync);
  const alerts = getAlerts(products, movements, hospital.lastSync);
  const forecasts = getForecasts(products, movements);
  const recent = getSortedMovements(movements, 8);

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-800">MedIoT 3.0</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Dashboard operacional
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Visão geral do almoxarifado: estoque, alertas, consumo e as últimas
            movimentações registradas no sistema.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-slate-200 bg-white"
            render={<Link href="/estoque" />}
          >
            <Boxes className="size-4" />
            Ver estoque
          </Button>
          <Button
            className="bg-teal-800 hover:bg-teal-900"
            render={<Link href="/movimentacoes" />}
          >
            <ArrowLeftRight className="size-4" />
            Registrar movimentação
          </Button>
        </div>
      </section>

      <KpiStrip
        productCount={stats.productCount}
        totalUnits={stats.totalUnits}
        lowStock={stats.lowStock}
        criticalOrZero={stats.criticalOrZero}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <FlowSection data={flow} />
        <AlertsPanel alerts={alerts} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MovementsTable movements={recent} />
        <ForecastPanel forecasts={forecasts} />
      </div>

      <ProductsTable products={products} />
    </>
  );
}
