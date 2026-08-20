import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HB_SESSION_UNAUTHORIZED } from "@/data/auth/session_unauthorized_events";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import {
  activateSessionUnauthorizedModal,
  resetSessionUnauthorizedGate,
  useSessionUnauthorizedUiStore,
} from "@/presentation/stores/session_unauthorized_ui_store";
import "@/presentation/styles/session_unauthorized_modal.css";

export function SessionUnauthorizedModal() {
  const navigate = useNavigate();
  const modalOpen = useSessionUnauthorizedUiStore((s) => s.modalOpen);

  useEffect(() => {
    const handler = () => {
      void usePartnerSessionStore.getState().signOut();
      activateSessionUnauthorizedModal();
    };
    window.addEventListener(HB_SESSION_UNAUTHORIZED, handler);
    return () => window.removeEventListener(HB_SESSION_UNAUTHORIZED, handler);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    navigate("/partners", { replace: true });
  }, [modalOpen, navigate]);

  if (!modalOpen) return null;

  return (
    <div className="ps-session-modal-root">
      <div className="ps-session-modal-backdrop" aria-hidden />
      <div
        className="ps-session-modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ps-session-modal-title"
        aria-describedby="ps-session-modal-desc"
      >
        <h2 id="ps-session-modal-title">Sesión finalizada</h2>
        <p id="ps-session-modal-desc">
          Tu sesión expiró o el acceso ya no es válido. Vuelve a iniciar sesión para continuar.
        </p>
        <div className="ps-session-modal-actions">
          <button
            type="button"
            onClick={() => resetSessionUnauthorizedGate()}
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
