import { hospital } from "@/lib/data";
import { formatDateTime } from "@/lib/analytics";
import { Activity, Wifi } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-teal-900/10 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 px-6 py-7 text-teal-50 shadow-[0_20px_50px_-28px_rgba(15,118,110,0.65)] sm:px-8 sm:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(94,234,212,0.35), transparent 40%), radial-gradient(circle at 85% 10%, rgba(56,189,248,0.22), transparent 35%), linear-gradient(135deg, transparent 0%, transparent 40%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.04) 41%, transparent 41%)",
        }}
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-white/10 px-3 py-1 text-xs font-medium text-teal-100 backdrop-blur">
            <Activity className="size-3.5" />
            MedIoT 2.0 · painel operacional
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            MedIoT
          </h1>
          <p className="mt-3 max-w-xl text-base text-teal-100/90 sm:text-lg">
            Estoque hospitalar com rastreio RFID, sincronização ESP32 e visão
            clara do que sai, do que falta e do que precisa ser reposto.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-200/80">
              Unidade
            </p>
            <p className="mt-1 font-medium text-white">{hospital.name}</p>
            <p className="text-sm text-teal-100/75">{hospital.sector}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-teal-200/80">
              <Wifi className="size-3.5" />
              Última sync
            </p>
            <p className="mt-1 font-medium text-white">
              {formatDateTime(hospital.lastSync)}
            </p>
            <p className="text-sm text-teal-100/75">ESP32 · Wi-Fi ativo</p>
          </div>
        </div>
      </div>
    </header>
  );
}
