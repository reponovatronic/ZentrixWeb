import { PartnerOrdersMainPane } from "@/presentation/components/partners/partner_orders_main_pane";
import { AdminPartnerViewBanner } from "@/presentation/components/partners/admin_partner_view_banner";
import { PartnerPanelHeaderTools } from "@/presentation/components/partners/partner_panel_header_tools";
import { usePartnersPortalRedirects } from "@/presentation/hooks/use_partners_portal_redirects";
import { useEffectivePortalPartnerId } from "@/presentation/hooks/use_effective_portal_partner_id";
import { usePartnerDashboardFilters } from "@/presentation/hooks/use_partner_dashboard_filters";
import { usePartnerPortalNavWhitelist } from "@/presentation/hooks/use_partner_portal_nav_whitelist";
import { partnerInitialsPartner, partnerPhotoSrc } from "@/presentation/utils/partner_display_utils";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { PartnerDashboard } from "@happy-bags/partner-dashboard";
import { useNavigate } from "react-router-dom";
import "@/presentation/styles/partners_orders.css";

export function PartnersOrdersPage() {
  const navigate = useNavigate();
  usePartnersPortalRedirects({ requireAdminImpersonation: true });
  const status = usePartnerSessionStore((s) => s.status);
  const partner = usePartnerSessionStore((s) => s.partner);
  const signOut = usePartnerSessionStore((s) => s.signOut);
  const filters = usePartnerDashboardFilters();
  const effectivePartnerId = useEffectivePortalPartnerId();
  const navWhitelist = usePartnerPortalNavWhitelist();

  async function handleSignOut() {
    await signOut();
    navigate("/partners");
  }

  function navClick(id: string) {
    if (id === "dashboard") navigate("/partners/panel");
    if (id === "orders") navigate("/partners/orders");
    if (id === "products") navigate("/partners/products");
    if (id === "partners") navigate("/partners/directory");
    if (id === "metrics") navigate("/partners/metrics");
    if (id === "profile") navigate("/partners/profile");
  }

  if (status === "loading" || !partner) {
    return (
      <div className="pd-panel-loading">
        <p>Cargando…</p>
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
      navItemWhitelist={navWhitelist ? [...navWhitelist] : null}
      floatingNotice={<AdminPartnerViewBanner />}
      onSignOut={handleSignOut}
      pageTitle="Gestión de órdenes"
      activeNavId="orders"
      headerTools={
        <PartnerPanelHeaderTools
          presetId={filters.presetId}
          onPresetChange={filters.setPresetId}
          customRange={filters.customRange}
          onCustomRangeChange={filters.setCustomRange}
        />
      }
      mainPane={
        <PartnerOrdersMainPane
          partnerId={effectivePartnerId ?? ""}
          partnerRole={partner.role}
        />
      }
      onNavItemClick={navClick}
    />
  );
}
