import { getAccessToken } from "@/data/auth/partner_auth_session_storage";
import { SessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { emitSessionUnauthorized } from "@/data/auth/session_unauthorized_events";
import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { devLoggedFetch } from "@/data/http/dev_http_log";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";

export function resolvePartnerMeUrl(): string {
  return resolveAuthApiPath("/partners/me");
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sesión cerrada o sin token.");
  }
  /** HTTPBearer (FastAPI/OpenAPI) espera el esquema canónico `Bearer` (RFC 6750). */
  const authValue = `Bearer ${token}`;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: authValue,
  };
}

/** Sin `Content-Type`: el navegador añade el boundary del multipart. */
function authMultipartHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sesión cerrada o sin token.");
  }
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function resolvePartnerPhotoUrl(): string {
  return resolveAuthApiPath("/partners/photo");
}

export async function getPartnerMeJson(signal?: AbortSignal): Promise<Record<string, unknown>> {
  const url = resolvePartnerMeUrl();

  let res: Response;
  try {
    res = await devLoggedFetch(url, {
      method: "GET",
      headers: authHeaders(),
      signal,
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
    /** Sin registro de partner aún: mismo criterio que cuerpo JSON `null` (alta vía PUT). */
    if (res.status === 404) {
      return {};
    }
    throw new Error(await readHttpErrorMessage(res, text));
  }
  return parsePartnerMeJsonBody(text);
}

/**
 * Muchas APIs envuelven el recurso en `data`. Si `data` es `null` o falta perfil,
 * el formulario debe mostrarse vacío (creación vía PUT).
 */
function normalizePartnerMePayload(parsed: unknown): Record<string, unknown> {
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
  if (Array.isArray(inner)) {
    if (inner.length === 0) return {};
    const first = inner[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      return first as Record<string, unknown>;
    }
    return {};
  }
  return {};
}

/** Respuesta válida pero sin objeto (p.ej. `null`, `""`): el perfil se muestra vacío donde no hay dato */
export function parsePartnerMeJsonBody(text: string): Record<string, unknown> {
  const t = text.replace(/^\uFEFF/, "").trim();
  if (t === "" || /^null$/i.test(t)) {
    return {};
  }
  try {
    const v = JSON.parse(t) as unknown;
    return normalizePartnerMePayload(v);
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
}

export async function putPartnerMeJson(
  body: Record<string, unknown>,
  signal?: AbortSignal
): Promise<Record<string, unknown>> {
  const url = resolvePartnerMeUrl();

  let res: Response;
  try {
    res = await devLoggedFetch(url, {
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

  if (!res.ok) {
    if (res.status === 401) {
      emitSessionUnauthorized();
      throw new SessionUnauthorizedError(await readHttpErrorMessage(res, text));
    }
    throw new Error(await readHttpErrorMessage(res, text));
  }

  return parsePartnerMeJsonBody(text);
}

function photoUrlFromPayload(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const o = value as Record<string, unknown>;
    for (const key of [
      "photo_url",
      "photoUrl",
      "photo",
      "url",
      "image_url",
      "imageUrl",
      "profile_photo",
      "profilePhoto",
    ]) {
      const v = o[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

/** Respuesta 200 de `PATCH /partners/photo`: JSON string con la URL o objeto envuelto. */
export function parsePartnerPhotoResponseBody(text: string): string {
  const t = text.replace(/^\uFEFF/, "").trim();
  if (!t) return "";
  try {
    const parsed = JSON.parse(t) as unknown;
    if (typeof parsed === "string" && parsed.trim()) return parsed.trim();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const root = parsed as Record<string, unknown>;
      const direct = photoUrlFromPayload(root);
      if (direct) return direct;
      if ("data" in root) {
        return photoUrlFromPayload(root.data);
      }
    }
  } catch {
    if (/^https?:\/\//i.test(t)) return t;
  }
  return "";
}

export async function patchPartnerPhoto(file: File, signal?: AbortSignal): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);

  let res: Response;
  try {
    res = await devLoggedFetch(resolvePartnerPhotoUrl(), {
      method: "PATCH",
      headers: authMultipartHeaders(),
      body: form,
      signal,
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

  return parsePartnerPhotoResponseBody(text);
}
