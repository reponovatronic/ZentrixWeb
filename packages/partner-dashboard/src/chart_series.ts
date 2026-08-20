import type { BagTypeBar } from "./mock_data";
import { mockBagTypes } from "./mock_data";
import type { BagDistributionBar, MonthlySalesPoint } from "./metrics_mock_data";
import { chartHasPositiveValues } from "./chart_axis_scale";

export type DashboardWeeklyChartPoint = { day: string; amountSol: number };

/** Sin datos del API: serie vacía (no mock). */
export function emptyWeeklySalesChart(): DashboardWeeklyChartPoint[] {
  return [];
}

export function emptyMonthlySalesChart(): MonthlySalesPoint[] {
  return [];
}

/** Usa datos del API solo si hay ventas; si no, vacío. */
export function resolveWeeklySalesForChart(
  data: DashboardWeeklyChartPoint[] | undefined,
  loading: boolean
): DashboardWeeklyChartPoint[] {
  if (loading) return [];
  if (!data?.length) return [];
  if (!chartHasPositiveValues(data.map((d) => d.amountSol))) return [];
  return data;
}

export function resolveBagTypesForChart(
  data: BagTypeBar[] | undefined,
  loading: boolean
): BagTypeBar[] {
  if (loading) return [];
  if (!data?.length) return [];
  if (!chartHasPositiveValues(data.map((d) => d.percent))) {
    return mockBagTypes.map((b) => ({ ...b, percent: 0, highlight: false }));
  }
  return data;
}

export function resolveMonthlySalesForChart(
  data: MonthlySalesPoint[] | undefined,
  loading: boolean
): MonthlySalesPoint[] {
  if (loading) return [];
  if (!data?.length) return [];
  if (!chartHasPositiveValues(data.map((d) => d.amountSol))) return [];
  return data;
}

export function resolveMetricsBagDistribution(
  data: BagDistributionBar[] | undefined,
  loading: boolean
): BagDistributionBar[] {
  if (loading) return [];
  if (!data?.length) return [];
  if (!chartHasPositiveValues(data.map((d) => d.units))) return [];
  return data;
}
