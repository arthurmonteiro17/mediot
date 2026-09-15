"use client";

import { useMemo, useState } from "react";
import { ProductsTable } from "@/components/dashboard/products-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStockLevel } from "@/lib/analytics";
import { useMediot } from "@/lib/store";
import type { StockLevel } from "@/lib/types";
import { PackagePlus, Search } from "lucide-react";

const levelFilters: { value: "todos" | StockLevel; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "ok", label: "Normal" },
  { value: "baixo", label: "Baixo" },
  { value: "critico", label: "Crítico" },
  { value: "zerado", label: "Zerado" },
];

const emptyForm = {
  name: "",
  sku: "",
  category: "EPIs",
  unit: "un",
  stock: "0",
  minStock: "20",
  criticalStock: "8",
  rfidTag: "",
};

export default function EstoquePage() {
  const { products, createProduct } = useMediot();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"todos" | StockLevel>("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.rfidTag.toLowerCase().includes(q);
      const matchesLevel =
        level === "todos" || getStockLevel(product) === level;
      return matchesQuery && matchesLevel;
    });
  }, [level, products, query]);

  const summary = useMemo(() => {
    const levels = products.map(getStockLevel);
    return {
      total: products.length,
      baixo: levels.filter((l) => l === "baixo").length,
      critico: levels.filter((l) => l === "critico").length,
      zerado: levels.filter((l) => l === "zerado").length,
    };
  }, [products]);

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const result = await createProduct({
      name: form.name,
      sku: form.sku,
      category: form.category,
      unit: form.unit,
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      criticalStock: Number(form.criticalStock),
      rfidTag: form.rfidTag,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(`${result.product.name} cadastrado no estoque.`);
    setForm(emptyForm);
    setOpen(false);
  }

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-800">Estoque</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Controle de materiais
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Consulte produtos, filtre por nível de estoque e cadastre novos
            materiais com tag RFID.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="bg-teal-800 hover:bg-teal-900">
                <PackagePlus className="size-4" />
                Novo produto
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar produto</DialogTitle>
              <DialogDescription>
                O produto entra no estoque e passa a aparecer no dashboard e nas
                movimentações.
              </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={submitProduct}>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Ex.: Luva de procedimento G"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sku: e.target.value }))
                    }
                    placeholder="LUV-PROC-G"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, unit: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Estoque inicial</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    value={form.stock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, stock: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Estoque mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min={0}
                    value={form.minStock}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, minStock: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="criticalStock">Estoque crítico</Label>
                  <Input
                    id="criticalStock"
                    type="number"
                    min={0}
                    value={form.criticalStock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        criticalStock: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfidTag">Tag RFID</Label>
                <Input
                  id="rfidTag"
                  value={form.rfidTag}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rfidTag: e.target.value }))
                  }
                  placeholder="Opcional — geramos a partir do SKU"
                />
              </div>
              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {error}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-teal-800 hover:bg-teal-900">
                  Salvar produto
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      {success && (
        <p className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {success}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Produtos", summary.total],
          ["Baixo", summary.baixo],
          ["Crítico", summary.critico],
          ["Zerado", summary.zerado],
        ].map(([label, value]) => (
          <Card
            key={label as string}
            className="border-slate-200/80 bg-white/85 shadow-none"
          >
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="font-display text-2xl font-semibold tabular-nums">
                {value as number}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 bg-white/85 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, SKU, categoria ou RFID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            value={level}
            onValueChange={(value) =>
              setLevel((value as "todos" | StockLevel) ?? "todos")
            }
          >
            <SelectTrigger className="w-full border-slate-200 bg-white sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levelFilters.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <ProductsTable
        products={filtered}
        title={`${filtered.length} produto${filtered.length === 1 ? "" : "s"}`}
      />
    </>
  );
}
