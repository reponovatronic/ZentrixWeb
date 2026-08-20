import type { MetricsRangeId } from "@happy-bags/partner-dashboard";
import {
  formatRangeDisplay,
  type DateRange,
} from "@/presentation/utils/date_range_utils";

export type PeriodChartCopy = {
  title: string;
  subtitle: string;
};

/** Título y subtítulo del gráfico de ventas según el tag del selector de periodo. */
export function getSalesChartCopy(
  presetId: MetricsRangeId,
  customRange: DateRange
): PeriodChartCopy {
  switch (presetId) {
    case "today":
      return {
        title: "Ventas de hoy",
        subtitle: "Ingresos del día (S/)",
      };
    case "yesterday":
      return {
        title: "Ventas de ayer",
        subtitle: "Ingresos de ayer (S/)",
      };
    case "this_week":
      return {
        title: "Ventas de la semana",
        subtitle: "Ingresos de la semana (S/)",
      };
    case "last_week":
      return {
        title: "Ventas de la semana pasada",
        subtitle: "Ingresos de la semana pasada (S/)",
      };
    case "this_month":
      return {
        title: "Ventas del mes",
        subtitle: "Ingresos del mes (S/)",
      };
    case "custom": {
      const from = customRange.from?.trim() ?? "";
      const to = customRange.to?.trim() ?? "";
      const range =
        from && to ? formatRangeDisplay(from, to) : "Periodo personalizado";
      return {
        title: "Ventas del periodo",
        subtitle: `Ingresos del ${range} (S/)`,
      };
    }
  }
}
