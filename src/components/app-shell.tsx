"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, ArrowLeftRight, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediot } from "@/lib/store";
import { formatDateTime } from "@/lib/analytics";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hospital, loading, ready, error, refresh } = useMediot();

  return (
    <div className="relative min-h-screen overflow-hidden">
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

      <div className="border-b border-teal-900/10 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-800 text-teal-50">
              <Activity className="size-5" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-slate-900">
                MedIoT
              </p>
              <p className="text-xs text-slate-500">
                {hospital.name} · {hospital.sector}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-800 text-teal-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <p className="text-xs text-slate-500 lg:text-right">
            {loading && !ready
              ? "Carregando banco…"
              : `Última sync · ${formatDateTime(hospital.lastSync)}`}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <p className="font-medium">Não foi possível carregar o banco.</p>
            <p className="mt-1 opacity-90">{error}</p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="mt-2 font-medium underline underline-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {loading && !ready ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-16 text-center text-slate-500">
            Carregando estoque e movimentações do banco SQLite…
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
