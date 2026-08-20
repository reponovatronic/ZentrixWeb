type PartnerProfilePasswordPanelProps = {
  busy: boolean;
  passwordNote: boolean;
  onShowIntegrationNote: () => void;
};

export function PartnerProfilePasswordPanel({
  busy,
  passwordNote,
  onShowIntegrationNote,
}: PartnerProfilePasswordPanelProps) {
  return (
    <article className="pp-panel">
      <div className="pp-panel-head">
        <h4>Cambiar contraseña</h4>
        <button
          type="button"
          className="pp-btn-solid"
          disabled={busy}
          onClick={onShowIntegrationNote}
        >
          Actualizar contraseña
        </button>
      </div>
      <p className="pp-muted-note">
        Cuando esté disponible, podrás cambiar tu contraseña desde aquí de forma segura.
      </p>
      <div className="pp-form-grid pp-form-grid--single">
        <div className="pp-field">
          <label>
            Contraseña actual <span className="pp-required">*</span>
          </label>
          <input type="password" autoComplete="current-password" disabled placeholder="" />
        </div>
        <div className="pp-field">
          <label>
            Nueva contraseña <span className="pp-required">*</span>
          </label>
          <input type="password" autoComplete="new-password" disabled placeholder="" />
        </div>
        <div className="pp-field">
          <label>
            Confirmar nueva contraseña <span className="pp-required">*</span>
          </label>
          <input type="password" autoComplete="new-password" disabled placeholder="" />
        </div>
      </div>
      {passwordNote ? (
        <p className="pp-muted-note">
          Te avisaremos cuando puedas completar el cambio de contraseña desde esta pantalla.
        </p>
      ) : null}
    </article>
  );
}
