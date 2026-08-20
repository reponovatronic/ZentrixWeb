import { useCallback, useEffect, useMemo, useState } from "react";
import { isSessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { AdminDashboardMetricsRepositoryImpl } from "@/data/repositories/admin_dashboard_metrics_repository_impl";
import type { AdminDashboardMetrics } from "@/domain/entities/admin_dashboard_metrics";
import {
  adminMetricsToBagTypes,
  adminMetricsToKpis,
  adminMetricsToWeeklySales,
} from "@/presentation/mappers/admin_dashboard_metrics_mapper";
import { usePartnerDashboardFiltersStore } from "@/presentation/stores/partner_dashboard_filters_store";
import { isPortalAdminApiMode } from "@/data/http/portal_api_mode";
import { useAdminPartnerViewHydrated } from "@/presentation/hooks/use_admin_partner_view_hydrated";
import {
  resolveDashboardDateQuery,
  resolvePartnerIdQuery,
} from "@/presentation/utils/dashboard_query_utils";
import type { BagTypeBar, KpiCard } from "@happy-bags/partner-dashboard";

const metricsRepo = new AdminDashboardMetricsRepositoryImpl();

export function usePartnerDashboardMetrics(partnerId: string | undefined) {
  const adminViewHydrated = useAdminPartnerViewHydrated();
  const presetId = usePartnerDashboardFiltersStore((s) => s.presetId);
  const customRange = usePartnerDashboardFiltersStore((s) => s.customRange);

  const dateQuery = useMemo(
    () => resolveDashboardDateQuery(presetId, customRange),
    [presetId, customRange]
  );

  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal: AbortSignal) => {
      const adminMode = isPortalAdminApiMode();
      if (adminMode && !adminViewHydrated) return;
      const pid = resolvePartnerIdQuery(partnerId);
      if (adminMode && !pid) {
        setMetrics(null);
        setError("No se encontró el identificador del socio.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await metricsRepo.fetchMetrics({
          partnerId: pid ?? 0,
          dateFrom: dateQuery.dateFrom,
          dateTo: dateQuery.dateTo,
          signal,
        });
        setMetrics(data);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (isSessionUnauthorizedError(e)) return;
        setMetrics(null);
        setError(
          e instanceof Error ? e.message : "No se pudieron cargar las métricas."
        );
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [partnerId, dateQuery.dateFrom, dateQuery.dateTo, adminViewHydrated]
  );

  useEffect(() => {
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const kpis = useMemo(
    () => (metrics ? adminMetricsToKpis(metrics) : undefined),
    [metrics]
  );

  const weeklySales = useMemo(
    () => (metrics ? adminMetricsToWeeklySales(metrics) : undefined),
    [metrics]
  );

  const bagTypes = useMemo(
    () => (metrics ? adminMetricsToBagTypes(metrics) : undefined),
    [metrics]
  );

  return {
    metrics,
    kpis,
    weeklySales,
    bagTypes,
    loading,
    error,
    dateQuery,
    reload: () => {
      const ac = new AbortController();
      void load(ac.signal);
      return () => ac.abort();
    },
  };
}
