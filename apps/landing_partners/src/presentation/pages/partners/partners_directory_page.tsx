import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import {
  isPartnerAdminRole,
  partnerInitialsPartner,
  partnerPhotoSrc,
} from "@/presentation/utils/partner_display_utils";
import { ADMIN_PORTAL_NAV_DIRECTORY_ONLY } from "@/presentation/utils/partner_admin_nav";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { PartnerDashboard } from "@happy-bags/partner-dashboard";
import { AdminPartnerViewBanner } from "@/presentation/components/partners/admin_partner_view_banner";
import { PartnerDirectoryMainPane } from "@/presentation/components/partners/partner_directory_main_pane";
import { PartnerPanelHeaderTools } from "@/presentation/components/partners/partner_panel_header_tools";
import { usePartnerDashboardFilters } from "@/presentation/hooks/use_partner_dashboard_filters";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@/presentation/styles/partners_orders.css";

export function PartnersDirectoryPage() {
  const navigate = useNavigate();
  const setViewedPartner = useAdminPartnerViewStore((s) => s.setViewedPartner);
  const status = usePartnerSessionStore((s) => s.status);
  const partner = usePartnerSessionStore((s) => s.partner);
  const refreshSession = usePartnerSessionStore((s) => s.refreshSession);
  const signOut = usePartnerSessionStore((s) => s.signOut);
  const periodFilter = usePartnerDashboardFilters();

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (status === "loading") return;
    if (!partner) {
      navigate("/partners", { replace: true });
      return;
    }
    if (!isPartnerAdminRole(partner.role)) {
      navigate("/partners/panel", { replace: true });
    }
  }, [status, partner, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate("/partners");
  }

  if (status === "loading" || !partner) {
    return (
      <div className="pd-panel-loading">
        <p>Cargando…</p>
      </div>
    );
  }

  if (!isPartnerAdminRole(partner.role)) {
    return (
      <div className="pd-panel-loading">
        <p>Redirigiendo…</p>
      </div>
    );
  }

  return (
    <PartnerDashboard
      partnerName={partner.displayName}
      partnerTag="Socio Happy Bag"
      partnerInitial={partnerInitialsPartner(partner)}
      partnerPhotoSrc={partnerPhotoSrc(partner)}
      partnerRole={partner.role}
      navItemWhitelist={[...ADMIN_PORTAL_NAV_DIRECTORY_ONLY]}
      onSignOut={handleSignOut}
      pageTitle="Partners"
      activeNavId="partners"
      headerTools={
        <PartnerPanelHeaderTools
          presetId={periodFilter.presetId}
          onPresetChange={periodFilter.setPresetId}
          customRange={periodFilter.customRange}
          onCustomRangeChange={periodFilter.setCustomRange}
        />
      }
      floatingNotice={<AdminPartnerViewBanner />}
      mainPane={
        <PartnerDirectoryMainPane
          onInspectRegisteredPartner={(row) => {
            setViewedPartner(row.id, row.businessName, partner.id);
            navigate("/partners/panel");
          }}
        />
      }
      onNavItemClick={(id) => {
        if (id === "dashboard") navigate("/partners/panel");
        if (id === "orders") navigate("/partners/orders");
        if (id === "products") navigate("/partners/products");
        if (id === "partners") navigate("/partners/directory");
        if (id === "metrics") navigate("/partners/metrics");
        if (id === "profile") navigate("/partners/profile");
      }}
    />
  );
}
