import { prisma } from "@/lib/db";
import { mapMovement, mapProduct, mapStaff } from "@/lib/mappers";
import type { CreateProductInput, RegisterMovementInput } from "@/lib/types";

export async function getBootstrapData() {
  const [settings, products, people, movements] = await Promise.all([
    prisma.hospitalSettings.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    prisma.staff.findMany({ orderBy: { name: "asc" } }),
    prisma.movement.findMany({ orderBy: { timestamp: "desc" } }),
  ]);

  if (!settings) {
    throw new Error("Configuração do hospital não encontrada. Rode o seed.");
  }

  return {
    hospital: {
      name: settings.name,
      sector: settings.sector,
      lastSync: settings.lastSync.toISOString(),
    },
    products: products.map(mapProduct),
    staff: people.map(mapStaff),
    movements: movements.map(mapMovement),
  };
}

export async function createProductInDb(input: CreateProductInput) {
  const name = input.name.trim();
  const sku = input.sku.trim().toUpperCase();

  if (!name || !sku) {
    return { ok: false as const, error: "Nome e SKU são obrigatórios." };
  }
  if (input.stock < 0 || input.minStock < 0 || input.criticalStock < 0) {
    return {
      ok: false as const,
      error: "Valores de estoque não podem ser negativos.",
    };
  }
  if (input.criticalStock > input.minStock) {
    return {
      ok: false as const,
      error: "O estoque crítico deve ser menor ou igual ao mínimo.",
    };
  }

  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) {
    return { ok: false as const, error: "Já existe um produto com este SKU." };
  }

  const now = new Date();
  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name,
        sku,
        category: input.category.trim() || "Geral",
        unit: input.unit.trim() || "un",
        stock: input.stock,
        minStock: input.minStock,
        criticalStock: input.criticalStock,
        rfidTag: input.rfidTag.trim() || `TAG-${sku}`,
      },
    });

    await tx.hospitalSettings.update({
      where: { id: 1 },
      data: { lastSync: now },
    });

    return created;
  });

  return {
    ok: true as const,
    product: mapProduct(product),
    lastSync: now.toISOString(),
  };
}

export async function registerMovementInDb(input: RegisterMovementInput) {
  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      ok: false as const,
      error: "Informe uma quantidade válida maior que zero.",
    };
  }

  const source = input.source ?? "manual";
  if (input.type !== "entrada" && input.type !== "saida") {
    return { ok: false as const, error: "Tipo de movimentação inválido." };
  }
  if (source !== "manual" && source !== "rfid") {
    return { ok: false as const, error: "Origem inválida." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });
      if (!product) {
        throw new Error("NOT_FOUND_PRODUCT");
      }

      const person = await tx.staff.findUnique({
        where: { id: input.staffId },
      });
      if (!person) {
        throw new Error("NOT_FOUND_STAFF");
      }

      if (input.type === "saida" && quantity > product.stock) {
        throw new Error(`INSUFFICIENT:${product.stock}:${product.unit}`);
      }

      const timestamp = new Date();
      const nextStock =
        input.type === "entrada"
          ? product.stock + quantity
          : product.stock - quantity;

      const [movement] = await Promise.all([
        tx.movement.create({
          data: {
            productId: input.productId,
            staffId: input.staffId,
            type: input.type,
            quantity,
            timestamp,
            source,
          },
        }),
        tx.product.update({
          where: { id: input.productId },
          data: { stock: nextStock },
        }),
        tx.hospitalSettings.update({
          where: { id: 1 },
          data: { lastSync: timestamp },
        }),
      ]);

      const updatedProduct = await tx.product.findUniqueOrThrow({
        where: { id: input.productId },
      });

      return {
        movement: mapMovement(movement),
        product: mapProduct(updatedProduct),
        lastSync: timestamp.toISOString(),
      };
    });

    return { ok: true as const, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "NOT_FOUND_PRODUCT") {
      return { ok: false as const, error: "Produto não encontrado." };
    }
    if (message === "NOT_FOUND_STAFF") {
      return { ok: false as const, error: "Funcionário não encontrado." };
    }
    if (message.startsWith("INSUFFICIENT:")) {
      const [, stock, unit] = message.split(":");
      return {
        ok: false as const,
        error: `Estoque insuficiente. Disponível: ${stock} ${unit}.`,
      };
    }
    throw error;
  }
}
