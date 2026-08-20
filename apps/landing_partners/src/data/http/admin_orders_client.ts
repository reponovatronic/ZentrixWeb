import { resolveAdminApiPath } from "@/data/http/partner_auth_client";
import {
  partnerAuthenticatedJson,
  unwrapApiData,
} from "@/data/http/partner_authenticated_fetch";

export type AdminOrdersListQuery = {
  partnerId: number;
  page?: number;
  limit?: number;
  status?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
};

function appendQuery(params: URLSearchParams, query: AdminOrdersListQuery): void {
  params.set("partner_id", String(query.partnerId));
  if (query.page != null) params.set("page", String(query.page));
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.status?.trim()) params.set("status", query.status.trim());
  if (query.orderId?.trim()) params.set("order_id", query.orderId.trim());
  if (query.dateFrom?.trim()) params.set("date_from", query.dateFrom.trim());
  if (query.dateTo?.trim()) params.set("date_to", query.dateTo.trim());
}

export function buildAdminOrdersUrl(query: AdminOrdersListQuery): string {
  const params = new URLSearchParams();
  appendQuery(params, query);
  return `${resolveAdminApiPath("/admin/orders")}?${params.toString()}`;
}

export function buildAdminOrderDetailUrl(orderId: number, partnerId: number): string {
  const params = new URLSearchParams();
  params.set("partner_id", String(partnerId));
  return `${resolveAdminApiPath(`/admin/orders/${orderId}`)}?${params.toString()}`;
}

/** `GET /admin/orders?partner_id=…` (vista admin) */
export async function getAdminOrdersListJson(
  query: AdminOrdersListQuery,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildAdminOrdersUrl(query);
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

/** `GET /admin/orders/{order_id}` */
export async function getAdminOrderDetailJson(
  orderId: number,
  partnerId: number,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildAdminOrderDetailUrl(orderId, partnerId);
  const parsed = await partnerAuthenticatedJson(url, { method: "GET", signal });
  const inner = unwrapApiData(parsed);
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return {};
}
