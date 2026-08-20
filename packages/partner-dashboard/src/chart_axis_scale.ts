/** Intervalos entre 0 y el tope (5 tramos → 6 marcas incluyendo 0). */
export const SALES_CHART_INTERVALS = 5;

/** Tope por defecto sin ventas (0, 10, 20, 30, 40, 50). */
const EMPTY_Y_TOP = 50;

export type ChartYAxisScale = {
  yTop: number;
  ticks: number[];
};

export function chartHasPositiveValues(values: number[]): boolean {
  return values.some((v) => Number.isFinite(v) && v > 0);
}

/**
 * Eje Y para gráficos de ventas (dashboard y métricas).
 * - Tope = múltiplo de 10 ≥ máximo (ej. 72 → 100).
 * - Siempre 5 intervalos iguales (ej. 0, 20, 40, 60, 80, 100).
 * - Sin datos: 0–50.
 */
export function computeSalesChartYAxis(values: number[]): ChartYAxisScale {
  const finite = values.filter((v) => Number.isFinite(v) && v >= 0);
  const rawMax = finite.length ? Math.max(...finite) : 0;

  if (rawMax <= 0) {
    const yTop = EMPTY_Y_TOP;
    const step = yTop / SALES_CHART_INTERVALS;
    return {
      yTop,
      ticks: Array.from({ length: SALES_CHART_INTERVALS + 1 }, (_, i) => i * step),
    };
  }

  const bucketsOfTen = Math.ceil(rawMax / 10);
  const yTop =
    10 * Math.ceil(bucketsOfTen / SALES_CHART_INTERVALS) * SALES_CHART_INTERVALS;
  const step = yTop / SALES_CHART_INTERVALS;

  return {
    yTop,
    ticks: Array.from({ length: SALES_CHART_INTERVALS + 1 }, (_, i) => i * step),
  };
}

/** @deprecated Usar `computeSalesChartYAxis`. */
export function computeChartYAxisScale(
  values: number[],
  options?: { tickCount?: number; minYTop?: number }
): ChartYAxisScale {
  void options;
  return computeSalesChartYAxis(values);
}

/** Formato compacto para ticks del eje Y (montos en soles). */
export function formatChartAxisAmount(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(Math.round(v));
}

/** Formato para tooltips de montos en soles. */
export function formatChartTooltipAmount(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(Math.round(v));
}
