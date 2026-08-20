import { getAccessToken } from "@/data/auth/partner_auth_session_storage";
import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { devLoggedFetch } from "@/data/http/dev_http_log";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";
import type { ApiBusinessTypeItem } from "@/domain/entities/mobile_dictionaries";

function resolveMobileDictionariesUrl(): string {
  return resolveAuthApiPath("/mobile/dictionaries");
}

/** GET `/mobile/dictionaries` — Bearer si hay sesión (perfil socio). */
function dictionariesHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/json",
  };
  const token = getAccessToken();
  if (token?.trim()) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

function readIntSafe(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim()) {
    const n = Number.parseInt(v.trim(), 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function readName(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  return "";
}

/** Parse `business_types` del JSON root. */
export function parseBusinessTypesFromDictionariesBody(
  root: Record<string, unknown>
): ApiBusinessTypeItem[] {
  const raw = root.business_types ?? root.businessTypes;
  if (!Array.isArray(raw)) return [];

  const out: ApiBusinessTypeItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const rec = row as Record<string, unknown>;
    const id =
      readIntSafe(rec.id) ??
      readIntSafe(rec.business_type_id) ??
      readIntSafe(rec.businessTypeId);
    if (id == null || id <= 0) continue;
    const name = readName(rec.name ?? rec.title ?? rec.label ?? rec.type_name);
    if (!name) continue;
    out.push({ id, name });
  }

  out.sort((a, b) => a.id - b.id);
  return out;
}

/** `business_types` vía GET `/mobile/dictionaries` (geo va en catálogo local del front). */
export async function fetchMobileBusinessTypes(signal?: AbortSignal): Promise<ApiBusinessTypeItem[]> {
  const url = resolveMobileDictionariesUrl();

  let res: Response;
  try {
    res = await devLoggedFetch(url, {
      method: "GET",
      headers: dictionariesHeaders(),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(await readHttpErrorMessage(res, text));
  }

  let root: Record<string, unknown>;
  try {
    root = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Respuesta inválida del servidor (dictionaries).");
  }

  const items = parseBusinessTypesFromDictionariesBody(root);
  return items;
}
