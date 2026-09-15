"use client";

import { useEffect, useMemo, useState } from "react";
import { MovementsTable } from "@/components/dashboard/movements-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSortedMovements } from "@/lib/analytics";
import { useMediot } from "@/lib/store";
import type { MovementType } from "@/lib/types";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function MovimentacoesPage() {
  const { products, movements, staff, registerMovement } = useMediot();
  const [productId, setProductId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [type, setType] = useState<MovementType>("saida");
  const [quantity, setQuantity] = useState("1");
  const [source, setSource] = useState<"manual" | "rfid">("manual");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<"todos" | MovementType>("todos");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productId && products[0]) setProductId(products[0].id);
  }, [productId, products]);

  useEffect(() => {
    if (!staffId && staff[0]) setStaffId(staff[0].id);
  }, [staff, staffId]);

  const selectedProduct = products.find((p) => p.id === productId);
  const sorted = useMemo(() => getSortedMovements(movements), [movements]);
  const visible = useMemo(() => {
    if (listFilter === "todos") return sorted;
    return sorted.filter((m) => m.type === listFilter);
  }, [listFilter, sorted]);

  const stats = useMemo(() => {
    const entradas = movements
      .filter((m) => m.type === "entrada")
      .reduce((sum, m) => sum + m.quantity, 0);
    const saidas = movements
      .filter((m) => m.type === "saida")
      .reduce((sum, m) => sum + m.quantity, 0);
    return { total: movements.length, entradas, saidas };
  }, [movements]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const result = await registerMovement({
      productId,
      staffId,
      type,
      quantity: Number(quantity),
      source,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const product = products.find((p) => p.id === productId);
    setSuccess(
      `${type === "entrada" ? "Entrada" : "Saída"} de ${result.movement.quantity} ${product?.unit ?? "un"} registrada para ${product?.name ?? "produto"}.`,
    );
    setQuantity("1");
  }

  return (
    <>
      <section>
        <p className="text-sm font-medium text-teal-800">Movimentações</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Entradas e saídas
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Registre movimentações manuais ou simule leitura RFID. Cada operação
          atualiza o estoque e aparece no dashboard.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-slate-200/80 bg-white/85 shadow-none">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Registros</p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white/85 shadow-none">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <ArrowDownLeft className="size-3.5 text-teal-700" />
              Volume de entradas
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums text-teal-800">
              {stats.entradas}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white/85 shadow-none">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <ArrowUpRight className="size-3.5 text-orange-700" />
              Volume de saídas
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums text-orange-800">
              {stats.saidas}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/80 bg-white/85 shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Nova movimentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label>Produto</Label>
                <Select
                  value={productId}
                  onValueChange={(value) => setProductId(value ?? "")}
                >
                  <SelectTrigger className="w-full border-slate-200 bg-white">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.stock} {product.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <p className="text-xs text-slate-500">
                    Estoque atual: {selectedProduct.stock}{" "}
                    {selectedProduct.unit} · RFID {selectedProduct.rfidTag}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Funcionário</Label>
                <Select
                  value={staffId}
                  onValueChange={(value) => setStaffId(value ?? "")}
                >
                  <SelectTrigger className="w-full border-slate-200 bg-white">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} · {person.rfidCard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Operação</Label>
                  <Select
                    value={type}
                    onValueChange={(value) =>
                      setType((value as MovementType) ?? "saida")
                    }
                  >
                    <SelectTrigger className="w-full border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Origem</Label>
                <Select
                  value={source}
                  onValueChange={(value) =>
                    setSource((value as "manual" | "rfid") ?? "manual")
                  }
                >
                  <SelectTrigger className="w-full border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="rfid">RFID / ESP32</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-900">
                  {success}
                </p>
              )}

              <Button
                type="submit"
                disabled={saving || !productId || !staffId}
                className="bg-teal-800 hover:bg-teal-900"
              >
                {saving
                  ? "Salvando…"
                  : `Registrar ${type === "entrada" ? "entrada" : "saída"}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
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
                variant={listFilter === value ? "default" : "outline"}
                className={
                  listFilter === value
                    ? "bg-teal-700 hover:bg-teal-800"
                    : "border-slate-200 bg-white"
                }
                onClick={() => setListFilter(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          <MovementsTable
            movements={visible}
            title="Histórico completo"
            showFilters={false}
          />
        </div>
      </div>
    </>
  );
}
