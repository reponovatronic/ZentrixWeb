import { type FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postForgotPasswordAuth } from "@/data/http/partner_password_reset_client";
import { PartnersAccessShell } from "@/presentation/components/partners/partners_access_shell";
import "@/presentation/styles/partners_access.css";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function PartnersRecoverRequestPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => isValidEmail(email), [email]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await postForgotPasswordAuth(email);
      navigate(
        `/partners/recover/reset?email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PartnersAccessShell
      topRightLink={{ to: "/", label: "← Sitio público" }}
    >
      <div className="ps-access-card">
        <div className="ps-access-card-icon ps-access-card-icon--lg">
          <img src="/partners/lock.png" alt="" width={160} height={160} />
        </div>
        <h1>Recuperar contraseña</h1>
        <p className="ps-sub">Te enviamos un enlace a tu correo</p>

        <div className="ps-info-box">
          <img src="/partners/mail_notification.png" alt="" width={24} height={24} />
          <p>
            Introduce tu correo y te enviaremos un enlace para restablecer tu
            contraseña. Revisa también tu carpeta de spam.
          </p>
        </div>

        <form onSubmit={(ev) => void handleSubmit(ev)}>
          {error ? (
            <p className="ps-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="ps-field">
            <label htmlFor="recover-email">Email</label>
            <div className="ps-input-wrap">
              <img src="/partners/ic_mail.svg" alt="" width={20} height={20} />
              <input
                id="recover-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="correo@negocio.com"
                value={email}
                onChange={(ev) => {
                  setEmail(ev.target.value);
                  setError(null);
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="ps-submit"
            disabled={!canSubmit || busy}
          >
            {busy ? "Enviando…" : "Enviar"}
          </button>
        </form>

        <div className="ps-recover-footer-link">
          <Link to="/partners">Volver al login</Link>
        </div>
      </div>
    </PartnersAccessShell>
  );
}
