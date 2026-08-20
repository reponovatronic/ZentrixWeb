import { resolveAdminApiPath } from "@/data/http/partner_auth_client";
import {
  partnerAuthenticatedJson,
  unwrapApiData,
} from "@/data/http/partner_authenticated_fetch";

export type AdminDashboardMetricsQuery = {
  partnerId: number;
  dateFrom?: string;
  dateTo?: string;
};

export function buildAdminDashboardMetricsUrl(query: AdminDashboardMetricsQuery): string {
  const params = new URLSearchParams();
  params.set("partner_id", String(query.partnerId));
  if (query.dateFrom?.trim()) params.set("date_from", query.dateFrom.trim());
  if (query.dateTo?.trim()) params.set("date_to", query.dateTo.trim());
  return `${resolveAdminApiPath("/admin/dashboard/metrics")}?${params.toString()}`;
}

/** `GET /admin/dashboard/metrics` */
export async function getAdminDashboardMetricsJson(
  query: AdminDashboardMetricsQuery,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildAdminDashboardMetricsUrl(query);
  const parsed = await partnerAuthenticatedJson(url, { method: "GET", signal });
  const inner = unwrapApiData(parsed);
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return {};
}
