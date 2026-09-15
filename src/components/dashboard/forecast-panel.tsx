"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediot } from "@/lib/store";
import type { Forecast } from "@/lib/types";
import { Clock3 } from "lucide-react";

export function ForecastPanel({ forecasts }: { forecasts: Forecast[] }) {
  const { products } = useMediot();

  return (
    <Card className="border-slate-200/80 bg-white/85 shadow-none backdrop-blur">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Clock3 className="size-4 text-teal-700" />
        <CardTitle className="text-base font-semibold">
          Previsão de falta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {forecasts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
            Nenhum produto com risco de falta nos próximos 10 dias.
          </p>
        ) : (
          forecasts.map((forecast) => {
            const product = products.find((p) => p.id === forecast.productId);
            if (!product) return null;
            const urgent =
              forecast.daysRemaining !== null && forecast.daysRemaining <= 3;
            return (
              <div
                key={forecast.productId}
                className={`rounded-xl border p-4 ${
                  urgent
                    ? "border-orange-200 bg-orange-50/70"
                    : "border-slate-200 bg-slate-50/60"
                }`}
              >
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="shrink-0 font-display text-lg font-semibold tabular-nums text-teal-800">
                    {forecast.daysRemaining === 0
                      ? "hoje"
                      : `${forecast.daysRemaining}d`}
                  </p>
                </div>
                <p className="text-sm text-slate-600">{forecast.message}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Consumo médio: {forecast.dailyAverage.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  {product.unit}/dia · estoque atual: {product.stock}{" "}
                  {product.unit}
                </p>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
