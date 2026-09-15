"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStockLevel, stockLevelLabel } from "@/lib/analytics";
import type { Product } from "@/lib/types";

function levelBadge(product: Product) {
  const level = getStockLevel(product);
  const styles = {
    ok: "border-teal-200 bg-teal-50 text-teal-800",
    baixo: "border-amber-200 bg-amber-50 text-amber-900",
    critico: "border-orange-200 bg-orange-50 text-orange-900",
    zerado: "border-rose-200 bg-rose-50 text-rose-900",
  } as const;

  return (
    <Badge variant="outline" className={styles[level]}>
      {stockLevelLabel(level)}
    </Badge>
  );
}

function stockProgress(product: Product) {
  const target = Math.max(product.minStock * 1.5, product.stock, 1);
  return Math.min(100, Math.round((product.stock / target) * 100));
}

export function ProductsTable({
  products,
  title = "Produtos do almoxarifado",
}: {
  products: Product[];
  title?: string;
}) {
  return (
    <Card className="border-slate-200/80 bg-white/85 shadow-none backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhum produto encontrado com esses filtros.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Material</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>RFID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {product.name}
                    </div>
                    <div className="text-xs text-slate-500">{product.sku}</div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {product.category}
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-semibold tabular-nums">
                        {product.stock} {product.unit}
                      </span>
                      <span className="text-slate-500">
                        mín. {product.minStock}
                      </span>
                    </div>
                    <Progress value={stockProgress(product)} className="h-1.5" />
                  </TableCell>
                  <TableCell>{levelBadge(product)}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {product.rfidTag}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
