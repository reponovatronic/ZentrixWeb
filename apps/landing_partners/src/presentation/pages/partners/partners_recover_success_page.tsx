import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PartnersAccessShell } from "@/presentation/components/partners/partners_access_shell";
import "@/presentation/styles/partners_access.css";

function formatAtEs(ts: number): string {
  const time = new Date(ts).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `hoy a las ${time}`;
}

export function PartnersRecoverSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const updatedAt = (location.state as { updatedAt?: number } | undefined)
    ?.updatedAt;

  useEffect(() => {
    if (updatedAt == null) {
      navigate("/partners", { replace: true });
    }
  }, [updatedAt, navigate]);

  if (updatedAt == null) {
    return null;
  }

  const statusLine = `Contraseña actualizada el ${formatAtEs(updatedAt)}`;

  return (
    <PartnersAccessShell
      topRightLink={{ to: "/", label: "← Sitio público" }}
    >
      <div className="ps-access-card">
        <div className="ps-access-card-icon ps-access-card-icon--lg">
          <img src="/partners/unlock.png" alt="" width={160} height={160} />
        </div>
        <h1>¡Contraseña actualizada!</h1>
        <p className="ps-sub">
          Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar
          sesión con tu nueva contraseña.
        </p>

        <div className="ps-success-banner" role="status">
          <span className="ps-success-banner-icon" aria-hidden>
            ✓
          </span>
          <span>{statusLine}</span>
        </div>

        <Link className="ps-submit ps-success-cta" to="/partners">
          Iniciar sesión
        </Link>
      </div>
    </PartnersAccessShell>
  );
}
