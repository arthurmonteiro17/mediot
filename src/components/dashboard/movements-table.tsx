"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, getProduct, getStaff } from "@/lib/analytics";
import type { Movement, MovementType } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight, Radio } from "lucide-react";

type Filter = "todos" | MovementType;

export function MovementsTable({ movements }: { movements: Movement[] }) {
  const [filter, setFilter] = useState<Filter>("todos");

  const filtered = useMemo(() => {
    if (filter === "todos") return movements;
    return movements.filter((m) => m.type === filter);
  }, [filter, movements]);

  return (
    <Card className="border-slate-200/80 bg-white/85 shadow-none backdrop-blur">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
        <CardTitle className="text-base font-semibold">
          Movimentações recentes
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todas"],
              ["saida", "Saídas"],
              ["entrada", "Entradas"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={filter === value ? "default" : "outline"}
              className={
                filter === value
                  ? "bg-teal-700 hover:bg-teal-800"
                  : "border-slate-200 bg-white"
              }
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
              const product = getProduct(movement.productId);
              const person = getStaff(movement.staffId);
              const isExit = movement.type === "saida";
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
                            : "border-teal-200 bg-teal-50 text-teal-800"
                        }
                      >
                        {isExit ? (
                          <ArrowUpRight className="size-3.5" />
                        ) : (
                          <ArrowDownLeft className="size-3.5" />
                        )}
                        {isExit ? "Saída" : "Entrada"}
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
