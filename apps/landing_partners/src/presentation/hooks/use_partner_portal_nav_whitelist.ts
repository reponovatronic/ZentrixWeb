import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import {
  isAdminPartnerImpersonationActive,
} from "@/presentation/utils/admin_partner_session_scope";
import {
  ADMIN_PORTAL_NAV_IMPERSONATION,
  BUSINESS_PARTNER_NAV_IDS,
} from "@/presentation/utils/partner_admin_nav";
import {
  isPartnerAdminRole,
  isPartnerBusinessRole,
} from "@/presentation/utils/partner_display_utils";

/**
 * Lista blanca lateral: socio tiene perfil/productos; admin impersonando no ve «Partners» ni «Productos».
 * El módulo Partners sólo en el directorio (`ADMIN_PORTAL_NAV_DIRECTORY_ONLY`).
 */
export function usePartnerPortalNavWhitelist(): readonly string[] | null {
  const partner = usePartnerSessionStore((s) => s.partner);
  const viewedPartnerId = useAdminPartnerViewStore((s) => s.viewedPartnerId);
  const scopedToPortalUserId = useAdminPartnerViewStore((s) => s.scopedToPortalUserId);

  if (!partner) return null;

  if (isPartnerBusinessRole(partner.role)) {
    return BUSINESS_PARTNER_NAV_IDS;
  }

  if (
    isPartnerAdminRole(partner.role) &&
    isAdminPartnerImpersonationActive(
      partner,
      viewedPartnerId,
      scopedToPortalUserId
    )
  ) {
    return ADMIN_PORTAL_NAV_IMPERSONATION;
  }

  return null;
}
