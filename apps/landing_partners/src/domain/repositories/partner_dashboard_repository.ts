import type { PartnerDashboard } from "@/domain/entities/partner_dashboard";

export interface PartnerDashboardRepository {
  fetchDashboard(abortSignal?: AbortSignal): Promise<PartnerDashboard>;
}
