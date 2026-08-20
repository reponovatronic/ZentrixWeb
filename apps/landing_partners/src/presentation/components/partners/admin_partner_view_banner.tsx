import { useNavigate } from "react-router-dom";
import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { isAdminPartnerImpersonationActive } from "@/presentation/utils/admin_partner_session_scope";
import "@/presentation/styles/admin_partner_view_banner.css";

/**
 * Chip flotante: admin viendo métricas/órdenes/productos como un socio seleccionado.
 */
export function AdminPartnerViewBanner() {
  const navigate = useNavigate();
  const partner = usePartnerSessionStore((s) => s.partner);
  const viewedPartnerId = useAdminPartnerViewStore((s) => s.viewedPartnerId);
  const scopedToPortalUserId = useAdminPartnerViewStore((s) => s.scopedToPortalUserId);
  const viewedPartnerLabel = useAdminPartnerViewStore((s) => s.viewedPartnerLabel);
  const clearViewedPartner = useAdminPartnerViewStore((s) => s.clearViewedPartner);

  if (
    !isAdminPartnerImpersonationActive(
      partner,
      viewedPartnerId,
      scopedToPortalUserId
    )
  )
    return null;

  const bizId = viewedPartnerId?.trim() ?? "";
  const title =
    viewedPartnerLabel?.trim() || `Socio #${bizId || "—"}`;

  function quitView() {
    clearViewedPartner();
    navigate("/partners/directory", { replace: true });
  }

  return (
    <div className="hb-admin-context-banner-inner" role="status">
      <div className="hb-admin-context-banner-text">
        <span className="hb-admin-context-banner-label">Vista de socio</span>
        <strong className="hb-admin-context-banner-name">{title}</strong>
      </div>
      <button type="button" className="hb-admin-context-banner-btn" onClick={quitView}>
        Quitar vista
      </button>
    </div>
  );
}
