/**
 * Datos de métricas (mock / futuro JSON de API) — alineado a la vista Métricas en Figma.
 */

export type MetricsKpi = {
  title: string;
  value: string;
  /** Texto en pastilla verde (tendencia o contexto). */
  trendLabel: string;
  trendUp: boolean;
  /** Mini serie para sparkline (mismos valores relativos que en dashboard). */
  spark: number[];
  /** Si es false, no se muestra icono de flecha en la pastilla (ej. calificación). */
  showTrendIcon?: boolean;
};

export type MonthlySalesPoint = {
  month: string;
  amountSol: number;
};

export type BagDistributionBar = {
  label: string;
  units: number;
  highlight?: boolean;
};

export const mockMetricsKpis: MetricsKpi[] = [
  {
    title: "Ingresos del mes",
    value: "S/6,428.30",
    trendLabel: "+ 23%",
    trendUp: true,
    spark: [120, 132, 128, 155, 148, 172, 168],
  },
  {
    title: "Órdenes del mes",
    value: "312",
    trendLabel: "45 más",
    trendUp: true,
    spark: [210, 218, 224, 248, 262, 288, 300],
  },
  {
    title: "Comida salvada",
    value: "624 KG",
    trendLabel: "Impacto real",
    trendUp: true,
    spark: [400, 420, 450, 480, 520, 580, 610],
    showTrendIcon: false,
  },
  {
    title: "Calificación",
    value: "4.8",
    trendLabel: "Basado en 142 valoraciones",
    trendUp: true,
    spark: [],
    showTrendIcon: false,
  },
];

/** Etiquetas del eje X del gráfico de ventas en métricas. */
export const METRICS_CHART_MONTH_LABELS = [
  "SET",
  "OCT",
  "NOV",
  "DIC",
  "ENE",
  "FEB",
  "MAR",
] as const;

/** Placeholder visual del gráfico de ventas en métricas. */
export const mockMetricsMonthlySales: MonthlySalesPoint[] = [
  { month: "SET", amountSol: 980 },
  { month: "OCT", amountSol: 1240 },
  { month: "NOV", amountSol: 1100 },
  { month: "DIC", amountSol: 1900 },
  { month: "ENE", amountSol: 1500 },
  { month: "FEB", amountSol: 1320 },
  { month: "MAR", amountSol: 1600 },
];

export const mockMetricsBagDistribution: BagDistributionBar[] = [
  { label: "Sorpresa\nitaliana", units: 142, highlight: true },
  { label: "Caja\nmixta", units: 98 },
  { label: "Sorpresa\njaponesa", units: 76 },
  { label: "Caja\npremium", units: 54 },
  { label: "Caja\ncaliente", units: 32 },
];

/** Mes resaltado en la línea (referencia vertical). */
export const mockMetricsHighlightMonth = "DIC";

export type MetricsRangeId =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "custom";

export const METRICS_RANGE_LABELS: Record<MetricsRangeId, string> = {
  today: "Hoy",
  yesterday: "Ayer",
  this_week: "Esta semana",
  last_week: "Sem. pasada",
  this_month: "Este mes",
  custom: "Personalizado",
};

const SCALE_BY_RANGE: Record<MetricsRangeId, number> = {
  today: 0.035,
  yesterday: 0.038,
  this_week: 0.22,
  last_week: 0.19,
  this_month: 1,
  custom: 1,
};

const SALES_SUBTITLE: Record<MetricsRangeId, string> = {
  today: "Ventas del día (referencia)",
  yesterday: "Ventas de ayer (referencia)",
  this_week: "Ventas de la semana (referencia)",
  last_week: "Semana anterior (referencia)",
  this_month: "Últimos 7 meses",
  custom: "Rango personalizado (referencia)",
};

function scaleSolAmount(s: string, factor: number): string {
  const m = s.match(/^S\/([\d.,]+)/);
  if (!m) return s;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (Number.isNaN(n)) return s;
  const v = Math.max(0, n * factor);
  return `S/${v.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function scaleKpiValue(s: string, title: string, factor: number): string {
  if (title === "Calificación") return s;
  if (title === "Comida salvada") {
    const n = parseInt(s, 10);
    if (!Number.isNaN(n)) return `${Math.max(0, Math.round(n * factor))} KG`;
    return s;
  }
  if (s.startsWith("S/")) return scaleSolAmount(s, factor);
  const onlyInt = s.match(/^(\d+)$/);
  if (onlyInt) {
    const n = parseInt(onlyInt[1], 10);
    return String(Math.max(1, Math.round(n * factor)));
  }
  return s;
}

function scaleTrendLabel(label: string, factor: number): string {
  const más = label.match(/^(\d+)\s+más$/i);
  if (más) {
    const n = Math.max(1, Math.round(parseInt(más[1], 10) * factor));
    return `${n} más`;
  }
  const pct = label.match(/^([+-])\s*(\d+)\s*%$/);
  if (pct) {
    const v = Math.max(1, Math.round(parseInt(pct[2], 10) * Math.sqrt(factor)));
    return `${pct[1]} ${v}%`;
  }
  const val = label.match(/Basado en (\d+) valoraciones/i);
  if (val) {
    const c = Math.max(5, Math.round(parseInt(val[1], 10) * Math.sqrt(factor)));
    return `Basado en ${c} valoraciones`;
  }
  return label;
}

function scaleSpark(vals: number[], factor: number): number[] {
  return vals.map((n) => Math.max(1, Math.round(n * factor)));
}

export type MetricsDataset = {
  kpis: MetricsKpi[];
  monthly: MonthlySalesPoint[];
  bags: BagDistributionBar[];
  salesSubtitle: string;
  scale: number;
};

/** Dataset vacío para carga o sin respuesta del API. */
export function buildEmptyMetricsDataset(
  rangeId: MetricsRangeId = "this_month"
): MetricsDataset {
  return {
    kpis: mockMetricsKpis.map((k) => ({
      ...k,
      value: "—",
      trendLabel: "—",
      spark: [],
    })),
    monthly: METRICS_CHART_MONTH_LABELS.map((month) => ({ month, amountSol: 0 })),
    bags: mockMetricsBagDistribution.map((b) => ({ ...b, units: 0, highlight: false })),
    salesSubtitle: SALES_SUBTITLE[rangeId],
    scale: 1,
  };
}

export function buildMetricsDataset(
  rangeId: MetricsRangeId,
  _custom?: { from: string; to: string }
): MetricsDataset {
  const scale = SCALE_BY_RANGE[rangeId] ?? 1;
  const kpis: MetricsKpi[] = mockMetricsKpis.map((k) => ({
    ...k,
    value: scaleKpiValue(k.value, k.title, scale),
    trendLabel: scaleTrendLabel(k.trendLabel, scale),
    spark: k.spark.length ? scaleSpark(k.spark, scale) : k.spark,
  }));

  const monthly: MonthlySalesPoint[] = mockMetricsMonthlySales.map((row) => ({
    ...row,
    amountSol: Math.max(0, Math.round(row.amountSol * scale)),
  }));

  const bags: BagDistributionBar[] = mockMetricsBagDistribution.map((b) => ({
    ...b,
    units: Math.max(1, Math.round(b.units * scale)),
  }));

  return {
    kpis,
    monthly,
    bags,
    salesSubtitle: SALES_SUBTITLE[rangeId],
    scale,
  };
}
