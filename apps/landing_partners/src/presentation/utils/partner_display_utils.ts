import type { Partner } from "@/domain/entities/partner";

/** Iniciales para avatar (nombre de negocio o email como respaldo). */
export function partnerInitials(displayName: string, emailFallback: string): string {
  const d = displayName.trim();
  if (d.length >= 2) {
    return d.slice(0, 2).toUpperCase();
  }
  if (d.length === 1) {
    return (d + emailFallback.charAt(0)).toUpperCase().slice(0, 2);
  }
  return emailFallback.trim().slice(0, 2).toUpperCase();
}

export function partnerInitialsPartner(partner: Partner): string {
  return partnerInitials(partner.displayName, partner.email);
}

export function partnerPhotoSrc(partner: Partner): string | undefined {
  const url = partner.photoUrl.trim();
  return url.length > 0 ? url : undefined;
}

const PORTAL_ALLOWED_ROLES = new Set(["admin", "partner"]);

function canonicalPortalRoleToken(role: string): string {
  return role.trim().toLowerCase().replace(/^role_/, "");
}

/** `user.role` admin (insensible a mayúsculas; admite prefijo `role_`). */
export function isPartnerAdminRole(role: string | null | undefined): boolean {
  return typeof role === "string" && role.trim().length > 0 && canonicalPortalRoleToken(role) === "admin";
}

/** Comercio socio (`role: "partner"`): APIs `/partners/*` y PATCH de estado. */
export function isPartnerBusinessRole(role: string | null | undefined): boolean {
  return typeof role === "string" && role.trim().length > 0 && canonicalPortalRoleToken(role) === "partner";
}

/** Solo cuentas de portal: administrador o partner (no `user`, cliente, etc.). */
export function isPartnerPortalAllowedRole(role: string | null | undefined): boolean {
  if (typeof role !== "string" || !role.trim()) return false;
  return PORTAL_ALLOWED_ROLES.has(canonicalPortalRoleToken(role));
}
