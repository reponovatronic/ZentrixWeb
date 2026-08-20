import type { Partner } from "@/domain/entities/partner";
import { parsePartnerApiNumericId } from "@/domain/utils/partner_api_id";
import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { isPartnerAdminRole } from "@/presentation/utils/partner_display_utils";

/** Impersonación válida sólo si el estado persistido corresponde a este usuario portal (`partner.id`). */
export function isAdminPartnerImpersonationActive(
  sessionPartner: Partner | null | undefined,
  viewedPartnerId: string | null | undefined,
  scopedToPortalUserId: string | null | undefined
): boolean {
  if (!sessionPartner || !isPartnerAdminRole(sessionPartner.role)) return false;
  const vid = viewedPartnerId?.trim() ?? "";
  const scope = scopedToPortalUserId?.trim() ?? "";
  const uid = sessionPartner.id.trim();
  if (!vid || !scope || !uid || scope !== uid) return false;
  return parsePartnerApiNumericId(vid) != null;
}

/**
 * Descarta impersonación inconsistente u obsoleta (LS / otra cuenta / sin ámbito).
 * Llamar tras login exitoso o `refreshSession` con usuario listo.
 */
export function reconcileAdminPartnerPersistedSelection(partner: Partner | null): void {
  const api = useAdminPartnerViewStore.getState();
  const vid = api.viewedPartnerId?.trim() ?? "";

  if (!partner) {
    if (vid) api.clearViewedPartner();
    return;
  }

  if (!isPartnerAdminRole(partner.role)) {
    if (vid) api.clearViewedPartner();
    return;
  }

  if (!vid) return;

  const scope = api.scopedToPortalUserId?.trim() ?? "";
  const uid = partner.id.trim();
  const vidOk = parsePartnerApiNumericId(vid) != null;
  if (!uid || !scope || scope !== uid || !vidOk) {
    api.clearViewedPartner();
  }
}
