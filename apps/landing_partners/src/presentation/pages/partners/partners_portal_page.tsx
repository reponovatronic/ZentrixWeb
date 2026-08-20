import { type FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import { isPartnerAdminRole } from "@/presentation/utils/partner_display_utils";
import { PartnersAccessShell } from "@/presentation/components/partners/partners_access_shell";
import "@/presentation/styles/partners_access.css";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function PartnersPortalPage() {
  const navigate = useNavigate();
  const signInWithEmailPassword = usePartnerSessionStore(
    (s) => s.signInWithEmailPassword
  );
  const signInBusy = usePartnerSessionStore((s) => s.signInBusy);
  const signInError = usePartnerSessionStore((s) => s.signInError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(
    () => isValidEmail(email) && password.length >= 1,
    [email, password]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || signInBusy) return;
    try {
      await signInWithEmailPassword(email, password);
      const p = usePartnerSessionStore.getState().partner;
      navigate(
        isPartnerAdminRole(p?.role ?? null) ? "/partners/directory" : "/partners/panel"
      );
    } catch {
      /* error en store (signInError) */
    }
  }

  return (
    <PartnersAccessShell
      topRightLink={{ to: "/", label: "← Página Principal" }}
    >
      <div className="ps-access-card">
        <div className="ps-access-card-icon">
          <img
            src="/logo_landing.svg"
            alt=""
            width={76}
            height={32}
          />
        </div>
        <h1>Bienvenido de nuevo</h1>
        <p className="ps-sub">Ingresa con tu cuenta de partner o de administrador</p>

        <form onSubmit={(ev) => void handleSubmit(ev)}>
          {signInError ? (
            <p className="ps-form-error" role="alert">
              {signInError}
            </p>
          ) : null}
          <div className="ps-field">
            <label htmlFor="partner-email">Email</label>
            <div className="ps-input-wrap">
              <img src="/partners/ic_mail.svg" alt="" width={20} height={20} />
              <input
                id="partner-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="correo@negocio.com"
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  usePartnerSessionStore.setState({ signInError: null });
                }}
              />
            </div>
          </div>
          <div className="ps-field">
            <label htmlFor="partner-password">Contraseña</label>
            <div className="ps-input-wrap">
              <img src="/partners/ic_lock.svg" alt="" width={20} height={20} />
              <input
                id="partner-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="ingrese contraseña"
                value={password}
                onChange={(ev) => {
                  setPassword(ev.target.value);
                  usePartnerSessionStore.setState({ signInError: null });
                }}
              />
              <button
                type="button"
                className="ps-toggle-vis"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <img
                  src="/partners/ic_visibility.svg"
                  alt=""
                  width={22}
                  height={22}
                />
              </button>
            </div>
          </div>
          <button
            type="button"
            className="ps-forgot"
            onClick={() => navigate("/partners/recover")}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <button
            type="submit"
            className="ps-submit"
            disabled={!canSubmit || signInBusy}
          >
            {signInBusy ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </PartnersAccessShell>
  );
}
