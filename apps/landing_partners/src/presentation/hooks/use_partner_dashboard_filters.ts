import { METRICS_RANGE_LABELS } from "@happy-bags/partner-dashboard";
import { useMemo } from "react";
import { usePartnerDashboardFiltersStore } from "@/presentation/stores/partner_dashboard_filters_store";
import { getPeriodFilterTriggerLabel } from "@/presentation/utils/period_filter_utils";
import { resolveDashboardDateQuery } from "@/presentation/utils/dashboard_query_utils";

/** Filtro de periodo compartido (dashboard, métricas, órdenes). Por defecto «Hoy». */
export function usePartnerDashboardFilters() {
  const presetId = usePartnerDashboardFiltersStore((s) => s.presetId);
  const setPresetId = usePartnerDashboardFiltersStore((s) => s.setPresetId);
  const customRange = usePartnerDashboardFiltersStore((s) => s.customRange);
  const setCustomRange = usePartnerDashboardFiltersStore((s) => s.setCustomRange);

  const triggerLabel = useMemo(
    () => getPeriodFilterTriggerLabel(presetId, customRange, METRICS_RANGE_LABELS),
    [presetId, customRange]
  );

  const dateQuery = useMemo(
    () => resolveDashboardDateQuery(presetId, customRange),
    [presetId, customRange]
  );

  return {
    presetId,
    setPresetId,
    customRange,
    setCustomRange,
    triggerLabel,
    dateQuery,
  };
}
