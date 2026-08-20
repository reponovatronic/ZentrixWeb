import type { AdminDashboardMetrics } from "@/domain/entities/admin_dashboard_metrics";
import type {
  AdminDashboardMetricsRepository,
  FetchAdminDashboardMetricsParams,
} from "@/domain/repositories/admin_dashboard_metrics_repository";
import { getAdminDashboardMetricsJson } from "@/data/http/admin_dashboard_metrics_client";
import { isPortalAdminApiMode } from "@/data/http/portal_api_mode";
import { getPartnerDashboardMetricsJson } from "@/data/http/partner_dashboard_metrics_client";
import { adminDashboardMetricsFromJson } from "@/presentation/mappers/admin_dashboard_metrics_mapper";

export class AdminDashboardMetricsRepositoryImpl implements AdminDashboardMetricsRepository {
  async fetchMetrics(params: FetchAdminDashboardMetricsParams): Promise<AdminDashboardMetrics> {
    const j = isPortalAdminApiMode()
      ? await getAdminDashboardMetricsJson(
          {
            partnerId: params.partnerId,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
          },
          params.signal
        )
      : await getPartnerDashboardMetricsJson(
          {
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
          },
          params.signal
        );
    return adminDashboardMetricsFromJson(j);
  }
}
