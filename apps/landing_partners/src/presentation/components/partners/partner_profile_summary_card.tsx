import type { ChangeEvent } from "react";
import type { PartnerProfile } from "@/domain/entities/partner_profile";
import { PartnerProfileSummaryToggle } from "@/presentation/components/partners/partner_profile_summary_toggle";

type PartnerProfileSummaryCardProps = {
  draft: PartnerProfile;
  initials: string;
  photoUploadBusy?: boolean;
  patchDraft: (partial: Partial<PartnerProfile>) => void;
  onPickPhoto: (file: File) => void;
  onDeleteAccount: () => void;
};

export function PartnerProfileSummaryCard({
  draft,
  initials,
  photoUploadBusy = false,
  patchDraft,
  onPickPhoto,
  onDeleteAccount,
}: PartnerProfileSummaryCardProps) {
  const statusDisplay = draft.statusLabel.trim() ? draft.statusLabel : "—";
  const photoUrl = draft.photoUrl.trim();

  function handleFileChange(ev: ChangeEvent<HTMLInputElement>): void {
    const file = ev.target.files?.[0] ?? null;
    ev.target.value = "";
    if (file) onPickPhoto(file);
  }

  return (
    <aside className="pp-summary" aria-label="Resumen del socio">
      <header className="pp-summary-head">
        <div className="pp-summary-avatar-wrap">
          <label
            className={`pp-summary-avatar ${photoUrl ? "pp-summary-avatar--photo" : ""} ${
              photoUploadBusy ? "pp-summary-avatar--busy" : ""
            }`}
            aria-label={photoUrl ? "Cambiar foto de perfil" : "Subir foto de perfil"}
          >
            <input
              type="file"
              className="pp-summary-avatar-input"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              disabled={photoUploadBusy}
              onChange={handleFileChange}
            />
            {photoUrl ? (
              <img className="pp-summary-avatar-img" src={photoUrl} alt="" />
            ) : (
              <span className="pp-summary-avatar-initials" aria-hidden>
                {initials}
              </span>
            )}
            {photoUploadBusy ? (
              <span className="pp-summary-avatar-overlay" aria-hidden>
                …
              </span>
            ) : null}
          </label>
          <p className="pp-summary-photo-hint">
            {photoUploadBusy ? "Subiendo foto…" : photoUrl ? "Cambiar foto" : "Subir foto"}
          </p>
        </div>
        <h3 className="pp-summary-name">{draft.businessName || "Tu negocio"}</h3>
        <p className="pp-summary-category">{draft.businessType?.trim() || "—"}</p>
      </header>

      <section className="pp-summary-block" aria-label="Datos del socio">
        <div className="pp-summary-row">
          <span className="pp-summary-label">Estado</span>
          {statusDisplay !== "—" ? (
            <span className="pp-status-pill">
              <span className="pp-status-pill-dot" aria-hidden />
              {statusDisplay}
            </span>
          ) : (
            <span className="pp-summary-value">—</span>
          )}
        </div>
        <div className="pp-summary-row">
          <span className="pp-summary-label">Miembro desde</span>
          <span className="pp-summary-value">
            {draft.memberSinceLabel.trim() ? draft.memberSinceLabel : "—"}
          </span>
        </div>
        <div className="pp-summary-row pp-summary-row--last">
          <span className="pp-summary-label">Total órdenes</span>
          <span className="pp-summary-value">
            {draft.ordersTotalDisplay.trim() ? draft.ordersTotalDisplay : "—"}
          </span>
        </div>
      </section>

      <section className="pp-summary-block pp-summary-block--toggles" aria-label="Preferencias">
        <PartnerProfileSummaryToggle
          title="Recibir órdenes"
          description="Recibe pedidos de clientes cercanos y gestiona cada solicitud de forma rápida y sencilla."
          checked={draft.receiveOrders}
          onChange={(v) => patchDraft({ receiveOrders: v })}
        />
        <PartnerProfileSummaryToggle
          title="Notificaciones"
          description="Mantente al tanto de nuevos pedidos, actualizaciones y mensajes en tiempo real."
          checked={draft.notificationsEnabled}
          onChange={(v) => patchDraft({ notificationsEnabled: v })}
        />
        <PartnerProfileSummaryToggle
          title="Visible en el mapa"
          description="Haz que tu negocio aparezca en el mapa para que más clientes cercanos puedan encontrarte."
          checked={draft.visibleOnMap}
          onChange={(v) => patchDraft({ visibleOnMap: v })}
        />
      </section>

      <footer className="pp-summary-footer">
        <button type="button" className="pp-btn-soft" onClick={onDeleteAccount}>
          Eliminar cuenta
        </button>
      </footer>
    </aside>
  );
}
