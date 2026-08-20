import { getAccessToken } from "@/data/auth/partner_auth_session_storage";
import { emitSessionUnauthorized } from "@/data/auth/session_unauthorized_events";
import { SessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";

function bankAccountsLog(label: string, ...rest: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log("[bank-accounts]", label, ...rest);
  }
}

export function resolveBankAccountsUrl(): string {
  return resolveAuthApiPath("/bank-accounts");
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

/**
 * GET `/bank-accounts`.
 * Devuelve `null` si no hay cuenta (404, lista vacía, objeto vacío).
 */
export async function getBankAccountJson(
  signal?: AbortSignal
): Promise<Record<string, unknown> | null> {
  const url = resolveBankAccountsUrl();
  const started = performance.now();
  bankAccountsLog("GET", url);

  let res: Response;
  try {
    res = await fetch(url, { method: "GET", headers: authHeaders(), signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  bankAccountsLog(
    "response GET",
    res.status,
    `${Math.round(performance.now() - started)} ms`,
    text.length > 280 ? `${text.slice(0, 280)}…` : text
  );

  if (res.status === 404) {
    return null;
  }
  if (res.status === 401) {
    emitSessionUnauthorized();
    throw new SessionUnauthorizedError(await readHttpErrorMessage(res, text));
  }
  if (!res.ok) {
    throw new Error(await readHttpErrorMessage(res, text));
  }

  const t = text.trim();
  if (t === "" || t === "null") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(t) as unknown;
  } catch {
    throw new Error("Respuesta inválida del servidor (bank-accounts GET)");
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "data" in (parsed as object)) {
    parsed = (parsed as Record<string, unknown>).data as unknown;
  }

  if (parsed === null) {
    return null;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return null;
    const first = parsed[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return first as Record<string, unknown>;
    }
    return null;
  }

  if (typeof parsed !== "object") {
    return null;
  }

  const obj = parsed as Record<string, unknown>;
  if (Object.keys(obj).length === 0) {
    return null;
  }

  return obj;
}

export async function postBankAccountJson(
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<void> {
  const url = resolveBankAccountsUrl();
  const started = performance.now();
  bankAccountsLog("POST", url);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  bankAccountsLog(
    "response POST",
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
}

export async function putBankAccountJson(
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<void> {
  const url = resolveBankAccountsUrl();
  const started = performance.now();
  bankAccountsLog("PUT", url);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  bankAccountsLog(
    "response PUT",
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
}
