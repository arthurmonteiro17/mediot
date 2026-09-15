import type { Movement, Product, Staff } from "@/lib/types";

type DbProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  criticalStock: number;
  rfidTag: string;
};

type DbStaff = {
  id: string;
  name: string;
  role: string;
  rfidCard: string;
};

type DbMovement = {
  id: string;
  productId: string;
  staffId: string;
  type: string;
  quantity: number;
  timestamp: Date;
  source: string;
};

export function mapProduct(product: DbProduct): Product {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    unit: product.unit,
    stock: product.stock,
    minStock: product.minStock,
    criticalStock: product.criticalStock,
    rfidTag: product.rfidTag,
  };
}

export function mapStaff(person: DbStaff): Staff {
  return {
    id: person.id,
    name: person.name,
    role: person.role,
    rfidCard: person.rfidCard,
  };
}

export function mapMovement(movement: DbMovement): Movement {
  return {
    id: movement.id,
    productId: movement.productId,
    staffId: movement.staffId,
    type: movement.type as Movement["type"],
    quantity: movement.quantity,
    timestamp: movement.timestamp.toISOString(),
    source: movement.source as Movement["source"],
  };
}
