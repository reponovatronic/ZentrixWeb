import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { postResetPasswordAuth } from "@/data/http/partner_password_reset_client";
import { PartnersAccessShell } from "@/presentation/components/partners/partners_access_shell";
import { PinCode6 } from "@/presentation/components/partners/pin_code_6";
import "@/presentation/styles/partners_access.css";

function passwordOk(p: string): boolean {
  return p.trim().length > 0;
}

export function PartnersRecoverResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email.trim()) {
      navigate("/partners/recover", { replace: true });
    }
  }, [email, navigate]);

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const mismatchHint =
    confirmPassword.length > 0 &&
    newPassword.length > 0 &&
    newPassword !== confirmPassword
      ? "Las contraseñas no coinciden"
      : null;

  const canSubmit = useMemo(
    () =>
      token.trim().length === 6 &&
      passwordOk(newPassword) &&
      passwordOk(confirmPassword) &&
      passwordsMatch,
    [token, newPassword, confirmPassword, passwordsMatch]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);
    try {
      await postResetPasswordAuth({
        token: token.trim(),
        newPassword,
        confirmPassword,
      });
      const updatedAt = Date.now();
      navigate("/partners/recover/success", { state: { updatedAt } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo restablecer la contraseña"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <PartnersAccessShell
      topRightLink={{ to: "/", label: "← Sitio público" }}
    >
      <div className="ps-access-card">
        <Link className="ps-recover-back" to="/partners/recover">
          ← Atrás
        </Link>
        <div className="ps-access-card-icon ps-access-card-icon--lg">
          <img src="/partners/mail_password.png" alt="" width={160} height={160} />
        </div>
        <h1>Nueva contraseña</h1>
        <p className="ps-sub">Elige una contraseña segura</p>

        <form onSubmit={(ev) => void handleSubmit(ev)}>
          {error ? (
            <p className="ps-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <p className="ps-pin-label">Código del correo (6 caracteres)</p>
          <PinCode6 value={token} onChange={setToken} disabled={busy} />

          <div className="ps-field">
            <label htmlFor="recover-new-pass">Nueva contraseña</label>
            <div className="ps-input-wrap">
              <img src="/partners/ic_lock.svg" alt="" width={20} height={20} />
              <input
                id="recover-new-pass"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder="ingrese nueva contraseña"
                value={newPassword}
                onChange={(ev) => {
                  setNewPassword(ev.target.value);
                  setError(null);
                }}
              />
              <button
                type="button"
                className="ps-toggle-vis"
                onClick={() => setShowNew((v) => !v)}
                aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <img src="/partners/ic_visibility.svg" alt="" width={22} height={22} />
              </button>
            </div>
          </div>

          <div className="ps-field">
            <label htmlFor="recover-confirm-pass">Confirmar contraseña</label>
            <div className="ps-input-wrap">
              <img src="/partners/ic_lock.svg" alt="" width={20} height={20} />
              <input
                id="recover-confirm-pass"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirme su contraseña"
                value={confirmPassword}
                onChange={(ev) => {
                  setConfirmPassword(ev.target.value);
                  setError(null);
                }}
              />
              <button
                type="button"
                className="ps-toggle-vis"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={
                  showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <img src="/partners/ic_visibility.svg" alt="" width={22} height={22} />
              </button>
            </div>
            {mismatchHint ? (
              <p className="ps-field-hint ps-field-hint--error">{mismatchHint}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="ps-submit"
            disabled={!canSubmit || busy}
          >
            {busy ? "Guardando…" : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </PartnersAccessShell>
  );
}
