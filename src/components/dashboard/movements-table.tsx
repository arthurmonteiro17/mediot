"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, getStaffById } from "@/lib/analytics";
import { useMediot } from "@/lib/store";
import type { Movement, MovementType } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, Radio } from "lucide-react";
import { Suspense } from "react";

type Filter = "todos" | MovementType;

function MovementsTableInner({
  movements,
  title = "Movimentações recentes",
  showFilters = true,
  queryKey = "mov",
}: {
  movements: Movement[];
  title?: string;
  showFilters?: boolean;
  queryKey?: string;
}) {
  const { products } = useMediot();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get(queryKey);
  const filter: Filter =
    raw === "saida" || raw === "entrada" ? raw : "todos";

  const filtered = useMemo(() => {
    if (filter === "todos") return movements;
    return movements.filter((m) => m.type === filter);
  }, [filter, movements]);

  function hrefFor(value: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todos") params.delete(queryKey);
    else params.set(queryKey, value);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <Card className="border-slate-200/80 bg-white/85 shadow-none backdrop-blur">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["todos", "Todas"],
                ["saida", "Saídas"],
                ["entrada", "Entradas"],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={hrefFor(value)}
                scroll={false}
                aria-pressed={filter === value}
                data-filter={value}
                className={
                  filter === value
                    ? "inline-flex h-8 items-center rounded-lg bg-teal-700 px-3 text-sm font-medium text-white hover:bg-teal-800"
                    : "inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {showFilters && (
          <p className="mb-3 text-xs text-slate-500">
            Mostrando {filtered.length} de {movements.length} registros
            {filter !== "todos" ? ` · filtro: ${filter}` : ""}
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Quando</TableHead>
              <TableHead>Funcionário</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Operação</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((movement) => {
              const product = products.find((p) => p.id === movement.productId);
              const person = getStaffById(movement.staffId);
              const isExit = movement.type === "saida";
              const isDevolucao =
                !isExit && movement.source === "rfid";
              const operationLabel = isExit
                ? "Saída"
                : isDevolucao
                  ? "Devolução"
                  : "Entrada";
              return (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDateTime(movement.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {person?.name ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {person?.rfidCard}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product?.name ?? "—"}</div>
                    <div className="text-xs text-slate-500">{product?.sku}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          isExit
                            ? "border-orange-200 bg-orange-50 text-orange-800"
                            : isDevolucao
                              ? "border-sky-200 bg-sky-50 text-sky-900"
                              : "border-teal-200 bg-teal-50 text-teal-800"
                        }
                      >
                        {isExit ? (
                          <ArrowUpRight className="size-3.5" />
                        ) : (
                          <ArrowDownLeft className="size-3.5" />
                        )}
                        {operationLabel}
                      </Badge>
                      {movement.source === "rfid" && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Radio className="size-3" /> RFID
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {movement.quantity}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhuma movimentação neste filtro.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function MovementsTable(props: {
  movements: Movement[];
  title?: string;
  showFilters?: boolean;
  queryKey?: string;
}) {
  return (
    <Suspense
      fallback={
        <Card className="border-slate-200/80 bg-white/85 shadow-none">
          <CardContent className="p-6 text-sm text-slate-500">
            Carregando movimentações…
          </CardContent>
        </Card>
      }
    >
      <MovementsTableInner {...props} />
    </Suspense>
  );
}
