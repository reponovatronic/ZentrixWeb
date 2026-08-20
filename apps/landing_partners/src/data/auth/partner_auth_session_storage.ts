import type { Partner } from "@/domain/entities/partner";
import { partnerPhotoUrlFromJson } from "@/domain/utils/resolve_partner_photo_url";

const ACCESS = "hb_partner_access_token";
const REFRESH = "hb_partner_refresh_token";
const TOKEN_TYPE = "hb_partner_token_type";
const USER_JSON = "hb_partner_user_json";

export function savePartnerAuthSession(payload: {
  accessToken: string;
  refreshToken: string;
  tokenType: string | null;
  user: Record<string, unknown> | null;
}): void {
  sessionStorage.setItem(ACCESS, payload.accessToken);
  sessionStorage.setItem(REFRESH, payload.refreshToken);
  if (payload.tokenType) {
    sessionStorage.setItem(TOKEN_TYPE, payload.tokenType);
  } else {
    sessionStorage.removeItem(TOKEN_TYPE);
  }
  if (payload.user) {
    sessionStorage.setItem(USER_JSON, JSON.stringify(payload.user));
  } else {
    sessionStorage.removeItem(USER_JSON);
  }
}

export function clearPartnerAuthSession(): void {
  sessionStorage.removeItem(ACCESS);
  sessionStorage.removeItem(REFRESH);
  sessionStorage.removeItem(TOKEN_TYPE);
  sessionStorage.removeItem(USER_JSON);
}

function decodeJwtPayloadRecord(accessToken: string): Record<string, unknown> | null {
  const parts = accessToken.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const json = atob(padded);
    const o = JSON.parse(json) as unknown;
    return o && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function pickRoleFromJwtPayload(payload: Record<string, unknown>): string | null {
  const single = [
    payload.role,
    payload.user_role,
    payload.userRole,
    payload.user_role_name,
    payload.userRoleName,
  ];
  for (const c of single) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  const roles = payload.roles;
  if (Array.isArray(roles) && roles.length > 0) {
    const first = roles[0];
    if (typeof first === "string" && first.trim()) return first.trim();
  }
  return null;
}

/** Rol declarado en el access token (sin verificar firma; solo UX / comprobación de portal). */
export function readRoleFromAccessToken(accessToken: string | null): string | null {
  if (!accessToken || !accessToken.trim()) return null;
  const payload = decodeJwtPayloadRecord(accessToken.trim());
  if (!payload) return null;
  return pickRoleFromJwtPayload(payload);
}

export function readStoredPartner(): Partner | null {
  const raw = sessionStorage.getItem(USER_JSON);
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as Record<string, unknown>;
    const base = mapUserJsonToPartner(u);
    if (base.role) return base;
    const fromToken = readRoleFromAccessToken(getAccessToken());
    if (fromToken) {
      return { ...base, role: fromToken };
    }
    return base;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS);
}

export function getStoredTokenType(): string | null {
  return sessionStorage.getItem(TOKEN_TYPE);
}

/** Actualiza usuario en sesión después de PATCH/PUT al perfil (sin tocar tokens). */
export function mergeStoredPartnerJson(
  updater: (current: Record<string, unknown>) => Record<string, unknown>
): void {
  const raw = sessionStorage.getItem(USER_JSON);
  if (!raw || raw.trim().length === 0) return;
  try {
    const base = JSON.parse(raw) as Record<string, unknown>;
    sessionStorage.setItem(USER_JSON, JSON.stringify(updater(base)));
  } catch {
    /* ignore corrupt session */
  }
}

/** Primer texto no vacío; evita que `""` bloquee `business_name` u otros campos (login JSON). */
function firstMeaningfulString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return "";
}

function parseRole(u: Record<string, unknown>): string | null {
  const r = u.role ?? u.user_role ?? u.userRole;
  if (typeof r !== "string" || !r.trim()) return null;
  return r.trim();
}

export function mapUserJsonToPartner(u: Record<string, unknown>): Partner {
  const firstLast = [u.first_name, u.lastName, u.last_name, u.firstName]
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .map((x) => (x as string).trim())
    .join(" ")
    .trim();

  const userName =
    typeof u.username === "string" && u.username.trim().length > 0
      ? u.username.trim()
      : "";

  const email =
    firstMeaningfulString(u.email) ||
    (userName.includes("@") ? userName : "") ||
    "";

  const displayName =
    firstMeaningfulString(
      u.full_name,
      u.fullName,
      u.business_name,
      u.businessName,
      u.name,
      firstLast || undefined,
      userName || undefined,
      u.email
    ) || "Usuario";

  const emailForSession = email || userName || "";

  return {
    id: String(u.id ?? ""),
    email: emailForSession,
    displayName,
    photoUrl: partnerPhotoUrlFromJson(u),
    role: parseRole(u),
  };
}
