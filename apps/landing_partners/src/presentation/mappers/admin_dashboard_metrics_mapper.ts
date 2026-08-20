import type {
  AdminDashboardMetrics,
  AdminMetricsBarPoint,
  AdminMetricsLinePoint,
} from "@/domain/entities/admin_dashboard_metrics";
import { formatChartDayLabel } from "@happy-bags/partner-dashboard";
import type {
  BagDistributionBar,
  BagTypeBar,
  KpiCard,
  MetricsDataset,
  MetricsKpi,
  MonthlySalesPoint,
} from "@happy-bags/partner-dashboard";

export type DashboardWeeklySalesPoint = { day: string; amountSol: number };

function num(j: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number.parseFloat(v.replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function str(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "string") return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function formatSol(amount: number): string {
  return `S/${amount.toLocaleString("es-PE", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCount(n: number): string {
  return n.toLocaleString("es-PE");
}

function neutralSpark(): number[] {
  return [8, 8, 9, 9, 10, 10, 10];
}

function linePointFromJson(j: Record<string, unknown>): AdminMetricsLinePoint {
  return {
    day: str(j, "day"),
    date: str(j, "date"),
    totalIncome: num(j, "total_income", "totalIncome"),
    totalOrders: num(j, "total_orders", "totalOrders"),
  };
}

function barPointFromJson(j: Record<string, unknown>): AdminMetricsBarPoint {
  return {
    businessTypeId: num(j, "business_type_id", "businessTypeId"),
    businessTypeName: str(j, "business_type_name", "businessTypeName", "name", "label"),
    totalOrders: num(j, "total_orders", "totalOrders"),
    percentage: num(j, "percentage", "percent"),
  };
}

export function adminDashboardMetricsFromJson(j: Record<string, unknown>): AdminDashboardMetrics {
  const lineRaw = j.line_chart ?? j.lineChart;
  const barRaw = j.bar_chart ?? j.barChart;

  return {
    todayOrders: num(j, "today_orders", "todayOrders"),
    todayIncome: num(j, "today_income", "todayIncome"),
    paidOrders: num(j, "paid_orders", "paidOrders"),
    preparingOrders: num(j, "preparing_orders", "preparingOrders"),
    readyOrders: num(j, "ready_orders", "readyOrders"),
    lineChart: Array.isArray(lineRaw)
      ? lineRaw
          .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
          .map(linePointFromJson)
      : [],
    barChart: Array.isArray(barRaw)
      ? barRaw
          .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
          .map(barPointFromJson)
      : [],
  };
}

export function adminMetricsToKpis(data: AdminDashboardMetrics): KpiCard[] {
  return [
    {
      title: "Ventas del día",
      value: formatSol(data.todayIncome),
      trendLabel: "Periodo",
      trendUp: data.todayIncome > 0,
      spark: neutralSpark(),
    },
    {
      title: "Órdenes recibidas",
      value: formatCount(data.todayOrders),
      trendLabel: "Periodo",
      trendUp: data.todayOrders > 0,
      spark: neutralSpark(),
    },
    {
      title: "En preparación",
      value: formatCount(data.preparingOrders),
      trendLabel: `${formatCount(data.paidOrders)} pagadas`,
      trendUp: data.preparingOrders > 0,
      spark: neutralSpark(),
    },
    {
      title: "Listas para recoger",
      value: formatCount(data.readyOrders),
      trendLabel: data.readyOrders > 0 ? "Activas" : "Sin pendientes",
      trendUp: data.readyOrders > 0,
      spark: neutralSpark(),
    },
  ];
}

export function adminMetricsToWeeklySales(
  data: AdminDashboardMetrics
): DashboardWeeklySalesPoint[] {
  const count = data.lineChart.length;
  return data.lineChart.map((p) => ({
    day: formatLineChartAxisLabel(p.day, p.date, count),
    amountSol: p.totalIncome,
  }));
}

function formatLineChartAxisLabel(
  dayRaw: string,
  fromDate: string | undefined,
  pointCount: number
): string {
  const iso = fromDate?.trim();
  if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    const d = new Date(`${iso}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      if (pointCount > 14) {
        return String(d.getDate());
      }
      return formatChartDayLabel(dayRaw, iso);
    }
  }
  return formatChartDayLabel(dayRaw, fromDate);
}

export function adminMetricsToMonthlySales(
  data: AdminDashboardMetrics
): MonthlySalesPoint[] {
  const count = data.lineChart.length;
  return data.lineChart.map((p) => ({
    month: formatLineChartAxisLabel(p.day, p.date, count),
    amountSol: p.totalIncome,
  }));
}

export function adminMetricsToMetricsDataset(
  data: AdminDashboardMetrics
): MetricsDataset {
  const kpis: MetricsKpi[] = adminMetricsToKpis(data).map((k) => ({
    ...k,
    showTrendIcon: k.title === "Calificación" || k.title === "Comida salvada" ? false : undefined,
  }));
  const bags: BagDistributionBar[] = adminMetricsToBagTypes(data).map((b) => ({
    label: b.label.replace(/\s+/g, "\n"),
    units: b.percent,
    highlight: b.highlight,
  }));
  return {
    kpis,
    monthly: adminMetricsToMonthlySales(data),
    bags,
    salesSubtitle: "",
    scale: 1,
  };
}

export function adminMetricsToBagTypes(data: AdminDashboardMetrics): BagTypeBar[] {
  const sorted = [...data.barChart].sort((a, b) => b.percentage - a.percentage);
  const maxPct = sorted[0]?.percentage ?? 0;
  return sorted.map((b) => ({
    label: b.businessTypeName.trim() || "Sin tipo",
    percent: Math.round(b.percentage),
    highlight: b.percentage === maxPct && maxPct > 0,
  }));
}
