export type MovementType = "entrada" | "saida";

export type StockLevel = "ok" | "baixo" | "critico" | "zerado";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  criticalStock: number;
  rfidTag: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  rfidCard: string;
}

export interface Movement {
  id: string;
  productId: string;
  staffId: string;
  type: MovementType;
  quantity: number;
  timestamp: string;
  source: "rfid" | "manual";
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  productId?: string;
  timestamp: string;
}

export interface Forecast {
  productId: string;
  daysRemaining: number | null;
  dailyAverage: number;
  message: string;
}

export interface DailyFlow {
  date: string;
  entradas: number;
  saidas: number;
}

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

export type HospitalInfo = {
  name: string;
  sector: string;
  lastSync: string;
};
