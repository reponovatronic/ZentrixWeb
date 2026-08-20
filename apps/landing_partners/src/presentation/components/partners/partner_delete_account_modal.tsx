import { useEffect, useId, useState } from "react";

const REASON_OPTIONS = [
  { value: "", label: "Selecciona un motivo" },
  { value: "close_business", label: "Cierro el negocio o cambio de rubro" },
  { value: "other_platform", label: "Uso otra plataforma" },
  { value: "technical", label: "Problemas técnicos o de la app" },
  { value: "privacy", label: "Privacidad o datos" },
  { value: "costs", label: "Costos o comisiones" },
  { value: "other", label: "Otro motivo" },
] as const;

export type PartnerDeleteAccountModalProps = {
  open: boolean;
  onClose: () => void;
};

function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 8l8 4M12 12v8M20 8l-8 4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.35-7-10a5 5 0 019-3 5 5 0 019 3c0 5.65-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  );
}

export function PartnerDeleteAccountModal({ open, onClose }: PartnerDeleteAccountModalProps) {
  const titleId = useId();
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setConfirmText("");
      setReason("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleClose(): void {
    onClose();
  }

  return (
    <div
      className="pp-del-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="pp-del-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="pp-del-head">
          <h2 id={titleId}>Eliminar cuenta</h2>
          <button
            type="button"
            className="pp-del-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="pp-del-body">
          <div className="pp-del-warn" role="alert">
            <div className="pp-del-warn-icon" aria-hidden>
              <span className="pp-del-warn-bang">!</span>
            </div>
            <div className="pp-del-warn-text">
              <strong>Esta acción es irreversible</strong>
              <p>
                Una vez eliminada tu cuenta, todos tus datos serán borrados permanentemente. No
                podremos recuperarlos.
              </p>
            </div>
          </div>

          <section className="pp-del-section" aria-labelledby="pp-del-what">
            <h3 id="pp-del-what" className="pp-del-section-title">
              ¿Qué se eliminará?
            </h3>
            <div className="pp-del-grid">
              <div className="pp-del-tile">
                <div className="pp-del-tile-icon">
                  <IconUser />
                </div>
                <div className="pp-del-tile-copy">
                  <strong>Información personal</strong>
                  <p>Nombre, correo, teléfono, foto de perfil y preferencias.</p>
                </div>
              </div>
              <div className="pp-del-tile">
                <div className="pp-del-tile-icon">
                  <IconBox />
                </div>
                <div className="pp-del-tile-copy">
                  <strong>Historial de pedidos</strong>
                  <p>Todos tus pedidos y códigos de validación.</p>
                </div>
              </div>
              <div className="pp-del-tile">
                <div className="pp-del-tile-icon">
                  <IconCard />
                </div>
                <div className="pp-del-tile-copy">
                  <strong>Métodos de pago</strong>
                  <p>Tarjetas guardadas.</p>
                </div>
              </div>
              <div className="pp-del-tile">
                <div className="pp-del-tile-icon pp-del-tile-icon--heart">
                  <IconHeart />
                </div>
                <div className="pp-del-tile-copy">
                  <strong>Favoritos y estadísticas</strong>
                  <p>Restaurantes guardados e impacto ambiental acumulado.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="pp-del-field">
            <label htmlFor="pp-del-confirm">Escribe &quot;Eliminar&quot; para confirmar</label>
            <input
              id="pp-del-confirm"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Eliminar"
            />
          </div>

          <div className="pp-del-field">
            <label htmlFor="pp-del-reason">¿Por qué te vas? (Opcional)</label>
            <select
              id="pp-del-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASON_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <footer className="pp-del-foot">
          <button type="button" className="pp-del-btn pp-del-btn--ghost" onClick={handleClose}>
            Cancelar
          </button>
          <button type="button" className="pp-del-btn pp-del-btn--danger" onClick={handleClose}>
            Eliminar
          </button>
        </footer>
      </div>
    </div>
  );
}
