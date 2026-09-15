import {
  AlertTriangle,
  Boxes,
  Package,
  PackageX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    key: "products",
    label: "Produtos cadastrados",
    icon: Package,
    accent: "text-teal-700 bg-teal-50",
  },
  {
    key: "units",
    label: "Unidades em estoque",
    icon: Boxes,
    accent: "text-sky-700 bg-sky-50",
  },
  {
    key: "low",
    label: "Estoque baixo",
    icon: AlertTriangle,
    accent: "text-amber-700 bg-amber-50",
  },
  {
    key: "critical",
    label: "Críticos ou zerados",
    icon: PackageX,
    accent: "text-orange-800 bg-orange-50",
  },
] as const;

export function KpiStrip({
  productCount,
  totalUnits,
  lowStock,
  criticalOrZero,
}: {
  productCount: number;
  totalUnits: number;
  lowStock: number;
  criticalOrZero: number;
}) {
  const values = {
    products: productCount,
    units: totalUnits.toLocaleString("pt-BR"),
    low: lowStock,
    critical: criticalOrZero,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.key}
            className="border-slate-200/80 bg-white/80 shadow-none backdrop-blur"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex size-11 items-center justify-center rounded-xl ${item.accent}`}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                  {values[item.key]}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
