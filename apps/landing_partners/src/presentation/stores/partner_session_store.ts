import { create } from "zustand";
import { clearPartnerAuthSession } from "@/data/auth/partner_auth_session_storage";
import { PartnerAuthRepositoryImpl } from "@/data/repositories/partner_auth_repository_impl";
import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { isPartnerPortalAllowedRole } from "@/presentation/utils/partner_display_utils";
import { resetSessionUnauthorizedGate } from "@/presentation/stores/session_unauthorized_ui_store";
import { reconcileAdminPartnerPersistedSelection } from "@/presentation/utils/admin_partner_session_scope";
import type { Partner } from "@/domain/entities/partner";
import type { PartnerAuthRepository } from "@/domain/repositories/partner_auth_repository";

type SessionStatus = "idle" | "loading" | "ready";

type PartnerSessionState = {
  status: SessionStatus;
  partner: Partner | null;
  error: string | null;
  signInBusy: boolean;
  signInError: string | null;
};

type PartnerSessionActions = {
  refreshSession: (options?: { silent?: boolean }) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const initial: PartnerSessionState = {
  status: "idle",
  partner: null,
  error: null,
  signInBusy: false,
  signInError: null,
};

const PORTAL_ROLE_DENIED_MESSAGE = "Acceso no autorizado.";

function buildStore(repo: PartnerAuthRepository) {
  return create<PartnerSessionState & PartnerSessionActions>((set) => ({
    ...initial,
    refreshSession: async (options?: { silent?: boolean }) => {
      const silent = options?.silent === true;
      if (!silent) set({ status: "loading", error: null });
      try {
        let partner = await repo.getSession();
        if (partner && !isPartnerPortalAllowedRole(partner.role)) {
          clearPartnerAuthSession();
          partner = null;
        }
        reconcileAdminPartnerPersistedSelection(partner);
        set({ status: "ready", partner, error: null });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Error desconocido";
        reconcileAdminPartnerPersistedSelection(null);
        set({ status: "ready", partner: null, error: message });
      }
    },
    signInWithEmailPassword: async (email, password) => {
      set({ signInBusy: true, signInError: null });
      try {
        await repo.signInWithEmailPassword(email, password);
        const partner = await repo.getSession();
        if (!partner || !isPartnerPortalAllowedRole(partner.role)) {
          clearPartnerAuthSession();
          reconcileAdminPartnerPersistedSelection(null);
          set({
            signInBusy: false,
            signInError: PORTAL_ROLE_DENIED_MESSAGE,
            partner: null,
            status: "ready",
            error: null,
          });
          throw new Error(PORTAL_ROLE_DENIED_MESSAGE);
        }
        resetSessionUnauthorizedGate();
        reconcileAdminPartnerPersistedSelection(partner);
        set({
          signInBusy: false,
          signInError: null,
          partner,
          status: "ready",
          error: null,
        });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Error desconocido";
        set({ signInBusy: false, signInError: message });
        throw e;
      }
    },
    signOut: async () => {
      await repo.signOut();
      useAdminPartnerViewStore.getState().clearViewedPartner();
      set(initial);
    },
  }));
}

const defaultRepo = new PartnerAuthRepositoryImpl();
export const usePartnerSessionStore = buildStore(defaultRepo);
