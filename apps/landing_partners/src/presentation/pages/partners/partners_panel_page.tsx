import { PartnerDashboard } from "@happy-bags/partner-dashboard";
import { PartnerPanelHeaderTools } from "@/presentation/components/partners/partner_panel_header_tools";
import { AdminPartnerViewBanner } from "@/presentation/components/partners/admin_partner_view_banner";
import { useDownloadReportModal } from "@/presentation/contexts/download_report_modal_context";
import { useAdminOrdersList } from "@/presentation/hooks/use_admin_orders_list";
import { usePartnerDashboardFilters } from "@/presentation/hooks/use_partner_dashboard_filters";
import { usePartnerDashboardMetrics } from "@/presentation/hooks/use_partner_dashboard_metrics";
import { useEffectivePortalPartnerId } from "@/presentation/hooks/use_effective_portal_partner_id";
import { usePartnerPortalNavWhitelist } from "@/presentation/hooks/use_partner_portal_nav_whitelist";
import { usePartnersPortalRedirects } from "@/presentation/hooks/use_partners_portal_redirects";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { adminOrderListToOrderRows } from "@/presentation/mappers/admin_orders_mapper";
import { getSalesChartCopy } from "@/presentation/utils/period_chart_labels";
import { partnerInitialsPartner, partnerPhotoSrc } from "@/presentation/utils/partner_display_utils";
import { useNavigate } from "react-router-dom";

export function PartnersPanelPage() {
  const navigate = useNavigate();
  const partner = usePartnerSessionStore((s) => s.partner);
  const signOut = usePartnerSessionStore((s) => s.signOut);
  const status = usePartnerSessionStore((s) => s.status);
  usePartnersPortalRedirects({ requireAdminImpersonation: true });
  const { openDownloadReport } = useDownloadReportModal();
  const filters = usePartnerDashboardFilters();
  const effectivePartnerId = useEffectivePortalPartnerId();
  const navWhitelist = usePartnerPortalNavWhitelist();

  const {
    kpis,
    weeklySales,
    bagTypes,
    loading: metricsLoading,
    error: metricsError,
  } = usePartnerDashboardMetrics(effectivePartnerId);

  const {
    data: ordersPage,
    loading: ordersLoading,
    error: ordersError,
  } = useAdminOrdersList({
    partnerId: effectivePartnerId,
    presetId: filters.presetId,
    customRange: filters.customRange,
    page: 1,
    limit: 8,
  });

  const chartCopy = getSalesChartCopy(filters.presetId, filters.customRange);

  const dashboardLoading = metricsLoading || ordersLoading;
  const dashboardError = metricsError ?? ordersError;
  const orders = ordersPage ? adminOrderListToOrderRows(ordersPage.items) : undefined;

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
        <p>Cargando panel…</p>
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
      activeNavId="dashboard"
      kpis={kpis}
      orders={orders}
      dashboardLoading={dashboardLoading}
      dashboardError={dashboardError}
      weeklySalesChart={{ data: weeklySales, loading: metricsLoading }}
      bagTypesChart={{ data: bagTypes, loading: metricsLoading }}
      salesChartTitle={chartCopy.title}
      salesChartSubtitle={chartCopy.subtitle}
      onDownloadReportClick={openDownloadReport}
      headerTools={
        <PartnerPanelHeaderTools
          allowCustom={false}
          presetId={filters.presetId}
          onPresetChange={filters.setPresetId}
          customRange={filters.customRange}
          onCustomRangeChange={filters.setCustomRange}
        />
      }
      onNavItemClick={navClick}
    />
  );
}
