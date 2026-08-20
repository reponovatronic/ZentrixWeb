import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import {
  partnerAuthenticatedJson,
  unwrapApiData,
} from "@/data/http/partner_authenticated_fetch";

export type PartnerScopedMetricsQuery = {
  dateFrom?: string;
  dateTo?: string;
};

export function buildPartnerDashboardMetricsUrl(query: PartnerScopedMetricsQuery): string {
  const params = new URLSearchParams();
  if (query.dateFrom?.trim()) params.set("date_from", query.dateFrom.trim());
  if (query.dateTo?.trim()) params.set("date_to", query.dateTo.trim());
  const qs = params.toString();
  return `${resolveAuthApiPath("/partners/dashboard/metrics")}${qs ? `?${qs}` : ""}`;
}

/** `GET /partners/dashboard/metrics` (rol `partner` en login). */
export async function getPartnerDashboardMetricsJson(
  query: PartnerScopedMetricsQuery,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildPartnerDashboardMetricsUrl(query);
  const parsed = await partnerAuthenticatedJson(url, { method: "GET", signal });
  const inner = unwrapApiData(parsed);
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return {};
}
