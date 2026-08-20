import {
  getAccessToken,
  mergeStoredPartnerJson,
} from "@/data/auth/partner_auth_session_storage";
import { SessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { getPartnerMeJson } from "@/data/http/partner_me_client";

function readNonEmptyString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return null;
}

/** Fusiona `GET /partners/me` en el JSON de sesión para `displayName` y datos del socio. */
function mergeMeIntoStoredUser(
  prev: Record<string, unknown>,
  me: Record<string, unknown>
): Record<string, unknown> {
  const businessName =
    readNonEmptyString(me.business_name) ??
    readNonEmptyString(me.businessName) ??
    readNonEmptyString(me.name);

  const next: Record<string, unknown> = { ...prev, ...me };

  if (me.id != null) next.id = me.id;
  if (businessName) {
    next.business_name = businessName;
    next.businessName = businessName;
    next.full_name = businessName;
    next.fullName = businessName;
  }

  const email = readNonEmptyString(me.email);
  if (email) next.email = email;

  return next;
}

/**
 * Tras login o al restaurar sesión: enriquece el usuario guardado con `GET /partners/me`.
 * Si el perfil aún no existe (404 → `{}`), se mantiene el usuario del login.
 */
export async function hydratePartnerSessionFromMe(signal?: AbortSignal): Promise<void> {
  if (!getAccessToken()) return;

  try {
    const me = await getPartnerMeJson(signal);
    if (Object.keys(me).length === 0) return;
    mergeStoredPartnerJson((prev) => mergeMeIntoStoredUser(prev, me));
  } catch (e) {
    if (e instanceof SessionUnauthorizedError) throw e;
    /* Red u otros errores: conservar datos del login. */
  }
}
