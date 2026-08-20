import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import {
  partnerAuthenticatedJson,
  unwrapApiData,
} from "@/data/http/partner_authenticated_fetch";

export type PartnerScopedOrdersListQuery = {
  page?: number;
  limit?: number;
  status?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
};

function appendPartnerOrdersQuery(params: URLSearchParams, query: PartnerScopedOrdersListQuery): void {
  if (query.page != null) params.set("page", String(query.page));
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.status?.trim()) params.set("status", query.status.trim());
  if (query.orderId?.trim()) params.set("order_id", query.orderId.trim());
  if (query.dateFrom?.trim()) params.set("date_from", query.dateFrom.trim());
  if (query.dateTo?.trim()) params.set("date_to", query.dateTo.trim());
}

export function buildPartnerOrdersListUrl(query: PartnerScopedOrdersListQuery): string {
  const params = new URLSearchParams();
  appendPartnerOrdersQuery(params, query);
  const qs = params.toString();
  return `${resolveAuthApiPath("/partners/orders")}${qs ? `?${qs}` : ""}`;
}

export function buildPartnerOrderDetailUrl(orderId: number): string {
  return resolveAuthApiPath(`/partners/orders/${orderId}`);
}

/** `GET /partners/orders` (rol socio; el token identifica el comercio). */
export async function getPartnerOrdersListJson(
  query: PartnerScopedOrdersListQuery,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildPartnerOrdersListUrl(query);
  const parsed = await partnerAuthenticatedJson(url, { method: "GET", signal });
  const inner = unwrapApiData(parsed);
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  if (Array.isArray(inner)) {
    return { items: inner };
  }
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {};
}

/** `GET /partners/orders/{order_id}` */
export async function getPartnerOrderDetailJson(
  orderId: number,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildPartnerOrderDetailUrl(orderId);
  const parsed = await partnerAuthenticatedJson(url, { method: "GET", signal });
  const inner = unwrapApiData(parsed);
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return {};
}
