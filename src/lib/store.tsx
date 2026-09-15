"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { hospital as hospitalSeed, movements as movementsSeed, products as productsSeed, staff } from "@/lib/data";
import type { Movement, MovementType, Product } from "@/lib/types";

export type RegisterMovementInput = {
  productId: string;
  staffId: string;
  type: MovementType;
  quantity: number;
  source?: Movement["source"];
};

export type CreateProductInput = {
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  criticalStock: number;
  rfidTag: string;
};

type MediotStore = {
  hospital: typeof hospitalSeed;
  staff: typeof staff;
  products: Product[];
  movements: Movement[];
  registerMovement: (
    input: RegisterMovementInput,
  ) => { ok: true; movement: Movement } | { ok: false; error: string };
  createProduct: (
    input: CreateProductInput,
  ) => { ok: true; product: Product } | { ok: false; error: string };
  updateProductThresholds: (
    productId: string,
    minStock: number,
    criticalStock: number,
  ) => { ok: true } | { ok: false; error: string };
};

const MediotContext = createContext<MediotStore | null>(null);

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MediotProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() =>
    productsSeed.map((p) => ({ ...p })),
  );
  const [movements, setMovements] = useState<Movement[]>(() =>
    movementsSeed.map((m) => ({ ...m })),
  );
  const [lastSync, setLastSync] = useState(hospitalSeed.lastSync);

  const value = useMemo<MediotStore>(() => {
    return {
      hospital: { ...hospitalSeed, lastSync },
      staff,
      products,
      movements,
      registerMovement(input) {
        const quantity = Number(input.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          return { ok: false, error: "Informe uma quantidade válida maior que zero." };
        }

        const product = products.find((p) => p.id === input.productId);
        if (!product) {
          return { ok: false, error: "Produto não encontrado." };
        }

        const person = staff.find((s) => s.id === input.staffId);
        if (!person) {
          return { ok: false, error: "Funcionário não encontrado." };
        }

        if (input.type === "saida" && quantity > product.stock) {
          return {
            ok: false,
            error: `Estoque insuficiente. Disponível: ${product.stock} ${product.unit}.`,
          };
        }

        const timestamp = new Date().toISOString();
        const movement: Movement = {
          id: newId("m"),
          productId: input.productId,
          staffId: input.staffId,
          type: input.type,
          quantity,
          timestamp,
          source: input.source ?? "manual",
        };

        setProducts((current) =>
          current.map((p) =>
            p.id === input.productId
              ? {
                  ...p,
                  stock:
                    input.type === "entrada"
                      ? p.stock + quantity
                      : p.stock - quantity,
                }
              : p,
          ),
        );
        setMovements((current) => [movement, ...current]);
        setLastSync(timestamp);

        return { ok: true, movement };
      },
      createProduct(input) {
        const name = input.name.trim();
        const sku = input.sku.trim().toUpperCase();
        if (!name || !sku) {
          return { ok: false, error: "Nome e SKU são obrigatórios." };
        }
        if (products.some((p) => p.sku.toUpperCase() === sku)) {
          return { ok: false, error: "Já existe um produto com este SKU." };
        }
        if (input.stock < 0 || input.minStock < 0 || input.criticalStock < 0) {
          return { ok: false, error: "Valores de estoque não podem ser negativos." };
        }
        if (input.criticalStock > input.minStock) {
          return {
            ok: false,
            error: "O estoque crítico deve ser menor ou igual ao mínimo.",
          };
        }

        const product: Product = {
          id: newId("p"),
          name,
          sku,
          category: input.category.trim() || "Geral",
          unit: input.unit.trim() || "un",
          stock: input.stock,
          minStock: input.minStock,
          criticalStock: input.criticalStock,
          rfidTag: input.rfidTag.trim() || `TAG-${sku}`,
        };

        setProducts((current) => [...current, product]);
        setLastSync(new Date().toISOString());
        return { ok: true, product };
      },
      updateProductThresholds(productId, minStock, criticalStock) {
        if (minStock < 0 || criticalStock < 0) {
          return { ok: false, error: "Limites não podem ser negativos." };
        }
        if (criticalStock > minStock) {
          return {
            ok: false,
            error: "O estoque crítico deve ser menor ou igual ao mínimo.",
          };
        }
        if (!products.some((p) => p.id === productId)) {
          return { ok: false, error: "Produto não encontrado." };
        }
        setProducts((current) =>
          current.map((p) =>
            p.id === productId ? { ...p, minStock, criticalStock } : p,
          ),
        );
        return { ok: true };
      },
    };
  }, [lastSync, movements, products]);

  return (
    <MediotContext.Provider value={value}>{children}</MediotContext.Provider>
  );
}

export function useMediot() {
  const ctx = useContext(MediotContext);
  if (!ctx) {
    throw new Error("useMediot deve ser usado dentro de MediotProvider.");
  }
  return ctx;
}
