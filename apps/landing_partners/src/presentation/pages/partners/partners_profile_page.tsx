import { PartnerDashboard } from "@happy-bags/partner-dashboard";
import { PartnerPanelHeaderTools } from "@/presentation/components/partners/partner_panel_header_tools";
import { PartnerProfileMainPane } from "@/presentation/components/partners/partner_profile_main_pane";
import type { PartnerProfile } from "@/domain/entities/partner_profile";
import { usePartnersPortalRedirects } from "@/presentation/hooks/use_partners_portal_redirects";
import { usePartnerPortalNavWhitelist } from "@/presentation/hooks/use_partner_portal_nav_whitelist";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { partnerInitials, partnerPhotoSrc } from "@/presentation/utils/partner_display_utils";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/presentation/styles/partners_profile.css";

export function PartnersProfilePage() {
  const navigate = useNavigate();
  usePartnersPortalRedirects({ blockAdminFromProfile: true });
  const status = usePartnerSessionStore((s) => s.status);
  const partner = usePartnerSessionStore((s) => s.partner);
  const signOut = usePartnerSessionStore((s) => s.signOut);
  const navWhitelist = usePartnerPortalNavWhitelist();

  const [sidebarPeek, setSidebarPeek] = useState<Pick<
    PartnerProfile,
    "businessName" | "businessType"
  > | null>(null);
  const onSidebarProfile = useCallback(setSidebarPeek, []);

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
        <p>Cargando perfil…</p>
      </div>
    );
  }

  const sidebarName =
    sidebarPeek?.businessName?.trim() ||
    partner.displayName ||
    partner.email.slice(0, 18);
  const sidebarTag = sidebarPeek?.businessType?.trim() || "Socio Happy Bag";
  const initial = partnerInitials(sidebarName, partner.email);

  return (
    <PartnerDashboard
      partnerName={sidebarName}
      partnerTag={sidebarTag}
      partnerInitial={initial}
      partnerPhotoSrc={partnerPhotoSrc(partner)}
      partnerRole={partner.role}
      navItemWhitelist={navWhitelist ? [...navWhitelist] : null}
      onSignOut={handleSignOut}
      pageTitle="Perfil"
      activeNavId="profile"
      headerTools={<PartnerPanelHeaderTools showPeriodFilter={false} />}
      mainPane={<PartnerProfileMainPane onSidebarProfile={onSidebarProfile} />}
      onNavItemClick={navClick}
    />
  );
}
