import { format, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { hospital, staff } from "./data";
import type {
  Alert,
  DailyFlow,
  Forecast,
  Movement,
  Product,
  Staff,
  StockLevel,
} from "./types";

export function getStockLevel(product: Product): StockLevel {
  if (product.stock <= 0) return "zerado";
  if (product.stock <= product.criticalStock) return "critico";
  if (product.stock <= product.minStock) return "baixo";
  return "ok";
}

export function findProduct(products: Product[], id: string) {
  return products.find((p) => p.id === id);
}

export function findStaff(people: Staff[], id: string) {
  return people.find((s) => s.id === id);
}

export function getStaffById(id: string) {
  return staff.find((s) => s.id === id);
}

export function getDashboardStats(products: Product[]) {
  const levels = products.map(getStockLevel);
  return {
    productCount: products.length,
    totalUnits: products.reduce((sum, p) => sum + p.stock, 0),
    lowStock: levels.filter((l) => l === "baixo").length,
    criticalOrZero: levels.filter((l) => l === "critico" || l === "zerado")
      .length,
  };
}

export function getDailyFlow(
  movements: Movement[],
  days = 7,
  referenceIso = new Date().toISOString(),
): DailyFlow[] {
  const today = parseISO(referenceIso);
  const buckets: DailyFlow[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = subDays(today, i);
    const key = format(day, "yyyy-MM-dd");
    buckets.push({ date: key, entradas: 0, saidas: 0 });
  }

  const index = new Map(buckets.map((b) => [b.date, b]));

  for (const movement of movements) {
    const key = format(parseISO(movement.timestamp), "yyyy-MM-dd");
    const bucket = index.get(key);
    if (!bucket) continue;
    if (movement.type === "entrada") bucket.entradas += movement.quantity;
    else bucket.saidas += movement.quantity;
  }

  return buckets;
}

export function getSortedMovements(movements: Movement[], limit?: number) {
  const sorted = [...movements].sort(
    (a, b) =>
      parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime(),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

/** Média diária de saídas nos últimos 14 dias → dias até possível falta. */
export function getForecasts(
  products: Product[],
  movements: Movement[],
): Forecast[] {
  const windowDays = 14;

  return products
    .map((product) => {
      const exits = movements.filter(
        (m) => m.productId === product.id && m.type === "saida",
      );
      const totalOut = exits.reduce((sum, m) => sum + m.quantity, 0);
      const dailyAverage = Number((totalOut / windowDays).toFixed(1));

      if (product.stock <= 0) {
        return {
          productId: product.id,
          daysRemaining: 0,
          dailyAverage,
          message: "Produto zerado — reposição imediata necessária.",
        };
      }

      if (dailyAverage <= 0) {
        return {
          productId: product.id,
          daysRemaining: null,
          dailyAverage: 0,
          message: "Sem consumo recente suficiente para projetar falta.",
        };
      }

      const daysRemaining = Math.max(
        0,
        Math.round(product.stock / dailyAverage),
      );

      return {
        productId: product.id,
        daysRemaining,
        dailyAverage,
        message:
          daysRemaining === 0
            ? "O estoque atual provavelmente será insuficiente ainda hoje."
            : `O estoque atual provavelmente será insuficiente em aproximadamente ${daysRemaining} dia${daysRemaining === 1 ? "" : "s"}.`,
      };
    })
    .filter(
      (f) =>
        f.daysRemaining !== null &&
        f.daysRemaining <= 10 &&
        (findProduct(products, f.productId)?.stock ?? 0) >= 0,
    )
    .sort((a, b) => (a.daysRemaining ?? 99) - (b.daysRemaining ?? 99));
}

export function getAlerts(
  products: Product[],
  movements: Movement[],
  lastSync = hospital.lastSync,
): Alert[] {
  const alerts: Alert[] = [];

  for (const product of products) {
    const level = getStockLevel(product);
    if (level === "zerado") {
      alerts.push({
        id: `a-${product.id}-zero`,
        severity: "critical",
        title: `${product.name} zerado`,
        detail: "Nenhuma unidade disponível no almoxarifado.",
        productId: product.id,
        timestamp: lastSync,
      });
    } else if (level === "critico") {
      alerts.push({
        id: `a-${product.id}-crit`,
        severity: "critical",
        title: `${product.name} em nível crítico`,
        detail: `Restam ${product.stock} ${product.unit} (limite crítico: ${product.criticalStock}).`,
        productId: product.id,
        timestamp: lastSync,
      });
    } else if (level === "baixo") {
      alerts.push({
        id: `a-${product.id}-low`,
        severity: "warning",
        title: `${product.name} com estoque baixo`,
        detail: `Estoque em ${product.stock} ${product.unit} — mínimo desejado: ${product.minStock}.`,
        productId: product.id,
        timestamp: lastSync,
      });
    }
  }

  const forecasts = getForecasts(products, movements).filter(
    (f) =>
      f.daysRemaining !== null &&
      f.daysRemaining > 0 &&
      f.daysRemaining <= 6,
  );

  for (const forecast of forecasts) {
    const product = findProduct(products, forecast.productId);
    if (!product || getStockLevel(product) === "zerado") continue;
    alerts.push({
      id: `a-${product.id}-forecast`,
      severity: forecast.daysRemaining! <= 3 ? "critical" : "warning",
      title: `Risco de falta: ${product.name}`,
      detail: forecast.message,
      productId: product.id,
      timestamp: lastSync,
    });
  }

  alerts.push({
    id: "a-sync",
    severity: "info",
    title: "ESP32 sincronizado via Wi-Fi",
    detail: "Leitor RFID do corredor B enviou o último lote de movimentações.",
    timestamp: lastSync,
  });

  const severityOrder = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), "dd MMM · HH:mm", { locale: ptBR });
}

export function formatDayLabel(isoDate: string) {
  return format(parseISO(`${isoDate}T12:00:00`), "EEE dd", { locale: ptBR });
}

export function stockLevelLabel(level: StockLevel) {
  switch (level) {
    case "ok":
      return "Normal";
    case "baixo":
      return "Baixo";
    case "critico":
      return "Crítico";
    case "zerado":
      return "Zerado";
  }
}
