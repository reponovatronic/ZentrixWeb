import type { AdminDashboardMetrics } from "@/domain/entities/admin_dashboard_metrics";

export type FetchAdminDashboardMetricsParams = {
  partnerId: number;
  dateFrom?: string;
  dateTo?: string;
  signal?: AbortSignal;
};

export interface AdminDashboardMetricsRepository {
  fetchMetrics(params: FetchAdminDashboardMetricsParams): Promise<AdminDashboardMetrics>;
}
