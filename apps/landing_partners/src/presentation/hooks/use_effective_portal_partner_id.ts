import type { Partner } from "@/domain/entities/partner";
import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import {
  isAdminPartnerImpersonationActive,
} from "@/presentation/utils/admin_partner_session_scope";
import {
  isPartnerAdminRole,
  isPartnerBusinessRole,
} from "@/presentation/utils/partner_display_utils";

/**
 * Id de socio a enviar a APIs `/partners/*` o `/admin/*` como `partner_id`.
 * Para el admin es el seleccionado en el directorio; para el socio, el propio usuario.
 */
export function resolveEffectivePartnerIdForApis(
  sessionPartner: Partner | null | undefined,
  adminViewPartnerId: string | null | undefined,
  scopedToPortalUserId: string | null | undefined
): string | undefined {
  if (!sessionPartner) return undefined;
  if (isPartnerBusinessRole(sessionPartner.role))
    return sessionPartner.id.trim() || undefined;
  if (
    isPartnerAdminRole(sessionPartner.role) &&
    isAdminPartnerImpersonationActive(
      sessionPartner,
      adminViewPartnerId,
      scopedToPortalUserId
    )
  ) {
    return (adminViewPartnerId ?? "").trim() || undefined;
  }
  return undefined;
}

export function useEffectivePortalPartnerId(): string | undefined {
  const partner = usePartnerSessionStore((s) => s.partner);
  const adminViewPartnerId = useAdminPartnerViewStore((s) => s.viewedPartnerId);
  const scopedToPortalUserId = useAdminPartnerViewStore((s) => s.scopedToPortalUserId);
  return resolveEffectivePartnerIdForApis(
    partner,
    adminViewPartnerId,
    scopedToPortalUserId
  );
}
