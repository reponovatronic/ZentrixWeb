import type { AdminPartnersListRequest } from "@/domain/entities/admin_partners_list";
import { resolveAdminApiPath } from "@/data/http/partner_auth_client";
import {
  partnerAuthenticatedJson,
  unwrapApiData,
} from "@/data/http/partner_authenticated_fetch";

/**
 * Obtiene `{ items, pagination }` ya sea como cuerpo directo como en tu API:
 * `{ "items": [...], "pagination": { ... } }`, o dentro de `{ data: { ... } }`.
 */
function adminPartnersListRootFromParsed(parsed: unknown): Record<string, unknown> {
  const asRecord = (u: unknown): Record<string, unknown> | null => {
    if (!u || typeof u !== "object" || Array.isArray(u)) return null;
    return u as Record<string, unknown>;
  };

  const unwrap = unwrapApiData(parsed);

  /** Orden: payload típico despu\'es de unwrap, raíz, `data` en raíz. */
  const rawRoot = asRecord(parsed);
  const candidates: unknown[] = [unwrap, parsed, rawRoot?.data];

  for (const c of candidates) {
    const r = asRecord(c);
    if (r && Array.isArray(r.items)) return r;
  }

  return asRecord(unwrap) ?? rawRoot ?? {};
}

export function buildAdminPartnersListUrl(query: AdminPartnersListRequest): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.isActive !== undefined) {
    params.set("is_active", query.isActive ? "true" : "false");
  }
  return `${resolveAdminApiPath("/admin/partners")}?${params.toString()}`;
}

/** `GET /admin/partners` */
export async function getAdminPartnersListJson(
  query: AdminPartnersListRequest,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = buildAdminPartnersListUrl(query);
  const parsed = await partnerAuthenticatedJson(url, { method: "GET", signal });
  return adminPartnersListRootFromParsed(parsed);
}
