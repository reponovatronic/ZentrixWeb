import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import {
  isAdminPartnerImpersonationActive,
} from "@/presentation/utils/admin_partner_session_scope";
import { isPartnerAdminRole } from "@/presentation/utils/partner_display_utils";
import { useAdminPartnerViewHydrated } from "@/presentation/hooks/use_admin_partner_view_hydrated";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Redirecciones de sesión y reglas específicas de rol administrador vs socio. */
export function usePartnersPortalRedirects(options?: {
  /**
   * Vistas tipo panel de socio (`/partners/panel`, `orders`, `metrics`, …): admin requiere socio elegido.
   */
  requireAdminImpersonation?: boolean;
  /**
   * Solo rol `partner` puede ver perfil socio; admins al directorio.
   */
  blockAdminFromProfile?: boolean;
}) {
  const navigate = useNavigate();
  const status = usePartnerSessionStore((s) => s.status);
  const partner = usePartnerSessionStore((s) => s.partner);
  const viewedPartnerId = useAdminPartnerViewStore((s) => s.viewedPartnerId);
  const scopedToPortalUserId = useAdminPartnerViewStore((s) => s.scopedToPortalUserId);
  const adminViewHydrated = useAdminPartnerViewHydrated();
  const refreshSession = usePartnerSessionStore((s) => s.refreshSession);

  const requireAdminImpersonation = options?.requireAdminImpersonation === true;
  const blockAdminFromProfile = options?.blockAdminFromProfile === true;

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (status === "loading") return;
    if (!partner) {
      navigate("/partners", { replace: true });
      return;
    }

    const admin = isPartnerAdminRole(partner.role);

    if (blockAdminFromProfile && admin) {
      navigate("/partners/directory", { replace: true });
      return;
    }

    if (requireAdminImpersonation && admin) {
      if (!adminViewHydrated) return;
      if (
        !isAdminPartnerImpersonationActive(
          partner,
          viewedPartnerId,
          scopedToPortalUserId
        )
      ) {
        navigate("/partners/directory", { replace: true });
      }
    }
  }, [
    status,
    partner,
    navigate,
    viewedPartnerId,
    scopedToPortalUserId,
    adminViewHydrated,
    blockAdminFromProfile,
    requireAdminImpersonation,
  ]);
}
