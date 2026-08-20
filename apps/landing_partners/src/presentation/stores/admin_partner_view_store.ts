import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Estado de impersonación persistido sólo válido cuando coincide `scopedToPortalUserId` con el admin sesión (`partner.id`). */
type AdminPartnerViewState = {
  viewedPartnerId: string | null;
  viewedPartnerLabel: string | null;
  /** `Partner.id` del usuario portal cuando se grabó impersonación (típicamente cuenta admin). */
  scopedToPortalUserId: string | null;
};

type AdminPartnerViewActions = {
  setViewedPartner: (
    partnerBusinessId: string,
    label: string,
    portalOwnerUserId: string
  ) => void;
  clearViewedPartner: () => void;
};

const initial: AdminPartnerViewState = {
  viewedPartnerId: null,
  viewedPartnerLabel: null,
  scopedToPortalUserId: null,
};

export const useAdminPartnerViewStore = create<AdminPartnerViewState & AdminPartnerViewActions>()(
  persist(
    (set) => ({
      ...initial,
      setViewedPartner: (partnerBusinessId, label, portalOwnerUserId) =>
        set({
          viewedPartnerId: partnerBusinessId.trim(),
          viewedPartnerLabel: label.trim(),
          scopedToPortalUserId: portalOwnerUserId.trim(),
        }),
      clearViewedPartner: () => set(initial),
    }),
    {
      name: "hb-admin-partner-view-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s): AdminPartnerViewState => ({
        viewedPartnerId: s.viewedPartnerId,
        viewedPartnerLabel: s.viewedPartnerLabel,
        scopedToPortalUserId: s.scopedToPortalUserId,
      }),
    }
  )
);
