import { getAccessToken } from "@/data/auth/partner_auth_session_storage";
import { SessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { emitSessionUnauthorized } from "@/data/auth/session_unauthorized_events";
import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";

function partnerApiLog(label: string, ...rest: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log("[partner-dashboard]", label, ...rest);
  }
}

export function resolvePartnerDashboardUrl(): string {
  return resolveAuthApiPath("/partners/dashboard");
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sesión cerrada o sin token.");
  }
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function normalizeDashboardPayload(parsed: unknown): Record<string, unknown> {
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  const root = parsed as Record<string, unknown>;
  if (!("data" in root)) {
    return root;
  }
  const inner = root.data;
  if (inner === null || inner === undefined) {
    return {};
  }
  if (typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return {};
}

export function parsePartnerDashboardJsonBody(text: string): Record<string, unknown> {
  const t = text.replace(/^\uFEFF/, "").trim();
  if (t === "" || /^null$/i.test(t)) {
    return {};
  }
  try {
    const v = JSON.parse(t) as unknown;
    return normalizeDashboardPayload(v);
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
}

export async function getPartnerDashboardJson(
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = resolvePartnerDashboardUrl();
  const started = performance.now();
  partnerApiLog("GET", url);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: authHeaders(),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  partnerApiLog(
    "response GET",
    res.status,
    `${Math.round(performance.now() - started)} ms`,
    text.length > 280 ? `${text.slice(0, 280)}…` : text
  );

  if (!res.ok) {
    if (res.status === 401) {
      emitSessionUnauthorized();
      throw new SessionUnauthorizedError(await readHttpErrorMessage(res, text));
    }
    throw new Error(await readHttpErrorMessage(res, text));
  }

  return parsePartnerDashboardJsonBody(text);
}
