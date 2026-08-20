import { getAccessToken } from "@/data/auth/partner_auth_session_storage";
import { SessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { emitSessionUnauthorized } from "@/data/auth/session_unauthorized_events";
import { devLoggedFetch } from "@/data/http/dev_http_log";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";

export function partnerAuthHeaders(): HeadersInit {
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

export function unwrapApiData(parsed: unknown): unknown {
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }
  const root = parsed as Record<string, unknown>;
  if ("data" in root) return root.data;
  return parsed;
}

export async function partnerAuthenticatedJson(
  url: string,
  init?: RequestInit
): Promise<unknown> {
  let res: Response;
  try {
    res = await devLoggedFetch(url, {
      ...init,
      headers: {
        ...partnerAuthHeaders(),
        ...(init?.headers ?? {}),
      },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) {
      emitSessionUnauthorized();
      throw new SessionUnauthorizedError(await readHttpErrorMessage(res, text));
    }
    throw new Error(await readHttpErrorMessage(res, text));
  }

  const t = text.replace(/^\uFEFF/, "").trim();
  if (t === "" || /^null$/i.test(t)) return null;
  try {
    return JSON.parse(t) as unknown;
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
}
