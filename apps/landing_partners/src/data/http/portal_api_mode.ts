import { readStoredPartner } from "@/data/auth/partner_auth_session_storage";
import { isPartnerAdminRole } from "@/presentation/utils/partner_display_utils";

export type PortalApiMode = "admin" | "partner";

/** Admin → `/admin/*` + `partner_id`; socio → `/partners/*` (token identifica el comercio). */
export function getPortalApiMode(): PortalApiMode {
  const role = readStoredPartner()?.role;
  return isPartnerAdminRole(role) ? "admin" : "partner";
}

export function isPortalAdminApiMode(): boolean {
  return getPortalApiMode() === "admin";
}
