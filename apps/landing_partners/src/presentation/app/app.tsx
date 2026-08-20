import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DownloadReportModalProvider } from "@/presentation/contexts/download_report_modal_context";
import { SessionUnauthorizedModal } from "@/presentation/components/partners/session_unauthorized_modal";
import { LandingPage } from "@/presentation/pages/landing/landing_page";
import { PartnersProfilePage } from "@/presentation/pages/partners/partners_profile_page";
import { PartnersOrdersPage } from "@/presentation/pages/partners/partners_orders_page";
import { PartnersDirectoryPage } from "@/presentation/pages/partners/partners_directory_page";
import { PartnersMetricsPage } from "@/presentation/pages/partners/partners_metrics_page";
import { PartnersPanelPage } from "@/presentation/pages/partners/partners_panel_page";
import { PartnersProductsPage } from "@/presentation/pages/partners/partners_products_page";
import { PartnersPortalPage } from "@/presentation/pages/partners/partners_portal_page";
import { PartnersRecoverRequestPage } from "@/presentation/pages/partners/partners_recover_request_page";
import { PartnersRecoverResetPage } from "@/presentation/pages/partners/partners_recover_reset_page";
import { PartnersRecoverSuccessPage } from "@/presentation/pages/partners/partners_recover_success_page";

export function App() {
  return (
    <BrowserRouter>
      <DownloadReportModalProvider>
        <SessionUnauthorizedModal />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/partners/recover/success"
            element={<PartnersRecoverSuccessPage />}
          />
          <Route
            path="/partners/recover/reset"
            element={<PartnersRecoverResetPage />}
          />
          <Route path="/partners/recover" element={<PartnersRecoverRequestPage />} />
          <Route path="/partners/panel" element={<PartnersPanelPage />} />
          <Route path="/partners/orders" element={<PartnersOrdersPage />} />
          <Route path="/partners/products" element={<PartnersProductsPage />} />
          <Route path="/partners/directory" element={<PartnersDirectoryPage />} />
          <Route path="/partners/metrics" element={<PartnersMetricsPage />} />
          <Route path="/partners/profile" element={<PartnersProfilePage />} />
          <Route path="/partners" element={<PartnersPortalPage />} />
        </Routes>
      </DownloadReportModalProvider>
    </BrowserRouter>
  );
}
