import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
  getRecentMovements,
} from "@/lib/analytics";
import { products } from "@/lib/data";

export default function HomePage() {
  const stats = getDashboardStats();
  const flow = getDailyFlow(7);
  const alerts = getAlerts();
  const forecasts = getForecasts();
  const recent = getRecentMovements(8);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(45,212,191,0.18), transparent), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(14,165,233,0.12), transparent), linear-gradient(180deg, #f4fbfb 0%, #eef5f8 45%, #f7fafc 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230f766e' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <DashboardHeader />

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

        <footer className="pb-4 text-center text-sm text-slate-500">
          MedIoT 2.0 — primeira versão do dashboard web · dados de demonstração
          prontos para evoluir para banco real e ESP32
        </footer>
      </div>
    </main>
  );
}
