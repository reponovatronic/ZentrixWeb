import {
  getAccessToken,
  savePartnerAuthSession,
} from "@/data/auth/partner_auth_session_storage";
import { devLoggedFetch } from "@/data/http/dev_http_log";

/** Igual que Flutter: `POST` + cuerpo `{ email, password }` ([LoginRequest]). */
export type PartnerLoginTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string | null;
  user: Record<string, unknown> | null;
};

/**
 * Dev: solo rutas `/auth/...` (mismo origen); Vite reenvía a `VITE_AUTH_API_URL` del `.env`.
 * Prod/preview: URL absoluta con la misma variable (inyectada en build).
 *
 * @param path Ruta del API, p.ej. `/auth/forgot-password`
 */
export function resolveAuthApiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (import.meta.env.DEV) {
    return p;
  }
  const base = import.meta.env.VITE_AUTH_API_URL?.trim().replace(/\/$/, "") ?? "";
  if (!base) {
    throw new Error(
      "Falta VITE_AUTH_API_URL en el bundle de producción. Configúrala al ejecutar vite build."
    );
  }
  return `${base}${p}`;
}

/**
 * Base para rutas `/admin/*`: `VITE_ADMIN_API_URL` si está definida; si no, misma política que
 * {@link resolveAuthApiPath} (solo `VITE_AUTH_API_URL` en prod, ruta relativa en dev para el proxy).
 */
export function resolveAdminApiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const adminOnlyBase = import.meta.env.VITE_ADMIN_API_URL?.trim().replace(/\/$/, "") ?? "";

  if (import.meta.env.DEV) {
    if (adminOnlyBase.length > 0) {
      return `${adminOnlyBase}${p}`;
    }
    return p;
  }

  const base = adminOnlyBase || import.meta.env.VITE_AUTH_API_URL?.trim().replace(/\/$/, "") || "";
  if (!base) {
    throw new Error(
      "[landing-partners] Falta VITE_ADMIN_API_URL o VITE_AUTH_API_URL en producción para el API admin."
    );
  }
  return `${base}${p}`;
}

export function resolveLoginPartnerUrl(): string {
  return resolveAuthApiPath("/auth/login-partner");
}

export function resolveLoginAccountUrl(): string {
  return resolveAuthApiPath("/auth/login");
}

function parseTokensResponse(json: Record<string, unknown>): PartnerLoginTokens {
  const dataObj =
    json.data && typeof json.data === "object" && !Array.isArray(json.data)
      ? (json.data as Record<string, unknown>)
      : null;

  const root = dataObj ?? json;

  const access = (root.access_token ?? root.accessToken) as string | undefined;
  const refresh = (root.refresh_token ?? root.refreshToken) as string | undefined;
  const tokenType = (root.token_type ?? root.tokenType) as string | undefined;
  let rawUser = root.user;
  if (
    (!rawUser || typeof rawUser !== "object" || Array.isArray(rawUser)) &&
    json.user &&
    typeof json.user === "object" &&
    !Array.isArray(json.user)
  ) {
    rawUser = json.user;
  }
  const user =
    rawUser &&
    typeof rawUser === "object" &&
    !Array.isArray(rawUser)
      ? (rawUser as Record<string, unknown>)
      : null;

  if (!access) {
    throw new Error("Respuesta inválida: no se recibió access_token");
  }

  return {
    accessToken: access,
    refreshToken: refresh ?? "",
    tokenType: tokenType ?? null,
    user,
  };
}

async function readErrorMessage(res: Response, bodyText: string): Promise<string> {
  try {
    const j = JSON.parse(bodyText) as Record<string, unknown>;
    const msg = j.message ?? j.detail ?? j.error;
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (Array.isArray(j.errors)) return String(j.errors[0]);
  } catch {
    /* texto plano */
  }
  if (bodyText.length > 0 && bodyText.length < 400) return bodyText;
  return res.statusText || `Error ${res.status}`;
}

/**
 * POST login en una ruta concreta; guarda sesión y devuelve tokens.
 */
async function postLoginAtPath(
  path: string,
  email: string,
  password: string
): Promise<PartnerLoginTokens> {
  const url = resolveAuthApiPath(path);

  const res = await devLoggedFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const text = await res.text();

  if (!res.ok) {
    if (
      res.status === 404 &&
      url.startsWith("/") &&
      (text.trimStart().startsWith("<") || text.includes("Not Found"))
    ) {
      throw new Error(
        "No hay backend en esta URL (404). Revisa VITE_AUTH_API_URL en .env y reinicia npm run dev."
      );
    }
    throw new Error(await readErrorMessage(res, text));
  }

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }

  const tokens = parseTokensResponse(json);
  const userToStore =
    tokens.user ??
    ({ email: email.trim() } as Record<string, unknown>);
  savePartnerAuthSession({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    tokenType: tokens.tokenType,
    user: userToStore,
  });

  return tokens;
}

/**
 * Llama al mismo endpoint que Flutter (`HappyBagAuthApi.loginPartner`).
 */
export async function postLoginPartner(
  email: string,
  password: string
): Promise<PartnerLoginTokens> {
  return postLoginAtPath("/auth/login-partner", email, password);
}

/**
 * Intenta primero el login de **partner**; si falla, el login **genérico** (`/auth/login`),
 * para cuentas que el backend solo acepta ahí (p. ej. administradores).
 * Mismo cuerpo `{ email, password }` en ambos.
 */
/**
 * Invalida la sesión en el servidor (`POST /auth/logout` + `Authorization: Bearer …`).
 * Si no hay token o la petición falla, no lanza: la limpieza local la hace el repositorio.
 */
export async function postLogoutAuth(): Promise<void> {
  const token = getAccessToken();
  if (!token?.trim()) return;

  const url = resolveAuthApiPath("/auth/logout");

  try {
    const res = await devLoggedFetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        /** HTTPBearer (FastAPI/OpenAPI) espera el esquema canónico `Bearer` (RFC 6750). */
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();

    if (!res.ok) {
      void readErrorMessage(res, text);
    }
  } catch {
    /* limpieza local en repositorio */
  }
}

export async function postLoginPartnerOrAccount(
  email: string,
  password: string
): Promise<PartnerLoginTokens> {
  let partnerError: unknown = null;
  try {
    return await postLoginAtPath("/auth/login-partner", email, password);
  } catch (e) {
    partnerError = e;
  }
  try {
    return await postLoginAtPath("/auth/login", email, password);
  } catch {
    if (partnerError instanceof Error) throw partnerError;
    throw new Error("No se pudo iniciar sesión");
  }
}
