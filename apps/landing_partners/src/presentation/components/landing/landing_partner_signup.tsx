import type { PartnerSignupRequest } from "@/domain/entities/partner_signup_request";
import { PARTNER_SIGNUP_MESSAGE_MAX } from "@/domain/utils/partner_signup_validation";
import { PartnerSignupRepositoryImpl } from "@/data/repositories/partner_signup_repository_impl";
import { openWhatsApp } from "@/presentation/components/landing/landing_whatsapp";
import { type FormEvent, useMemo, useState } from "react";

const signupRepo = new PartnerSignupRepositoryImpl();

const CONTACT_METHODS = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    title: "Llamanos",
    text: "+51 935 624 189",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    title: "LinkedIn",
    text: "ZENTRIX LATAM",
    url: "https://www.linkedin.com/in/zentrix-latam-8b1149430/?isSelfProfile=true",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </svg>
    ),
    title: "Correo",
    text: "ventas@zentrixlatam.com",
  },
  {icon: (
      <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-3.77V2h-3.62v13.044a2.92 2.92 0 1 1-2.92-2.92c.247 0 .49.031.72.09v-3.7a6.623 6.623 0 1 0 5.82 6.53V8.696a8.39 8.39 0 0 0 4.91 1.574V6.686h-1.14z" />
    </svg>
    ),
    title: "Tik Tok",
    text: "@Zentrix_Latam",
    url: "https://www.tiktok.com/@Zentrix_Latam",},

] as const;
const EMPTY_FORM: PartnerSignupRequest = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  businessTypeId: 0,
  message: "",
};



function RequiredLabel({ children }: { children: string }) {
  return (
    <>
      {children} <span className="hb-required">*</span>
    </>
  );
}

export function LandingPartnerSignup() {
  const [form, setForm] = useState<PartnerSignupRequest>(EMPTY_FORM);
  const [businessTypeIdRaw, setBusinessTypeIdRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const messageCount = form.message.length;

  const canSubmit = useMemo(() => {
    return (

      form.contactName.trim().length > 0 &&
      // form.email.trim().length > 0 &&
      form.phone.trim().length > 0 &&

      messageCount <= PARTNER_SIGNUP_MESSAGE_MAX
    );
  }, [form, businessTypeIdRaw, messageCount]);

  function patch(partial: Partial<PartnerSignupRequest>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();

  if (!canSubmit || busy || submitted) return;

  openWhatsApp(
    form.contactName,
    form.phone
  );
}

  return (
  <section
    className="hb-partner-section"
    id="partners"
    aria-labelledby="hb-partner-signup-title"
  >
    <div className="hb-partner-container">
      <div className="hb-partner-grid">

        {/* =========================
            COLUMNA IZQUIERDA
        ========================= */}
        <div className="hb-partner-info">

          <h2
            className="hb-partner-main-title"
            id="hb-partner-signup-title"
          >
            ¿Listo para transformar tu negocio?
          </h2>

          <p className="hb-partner-subtitle">
            Estamos aquí para ayudarte a escalar. Contáctanos directamente
            o déjanos un mensaje.
          </p>

          <div className="hb-contact-list">
            {CONTACT_METHODS.map((item) => {
  const content = (
    <>
      <div className="hb-contact-icon">
        {item.icon}
      </div>

      <div className="hb-contact-details">
        <strong className="hb-contact-name">
          {item.title}
        </strong>

        <span className="hb-contact-desc">
          {item.text}
        </span>
      </div>
    </>
  );

  if ("url" in item && item.url) {
    return (
      <a
        key={item.title}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hb-contact-card"
      >
        {content}
      </a>
    );
  }

  return (
    <div
      key={item.title}
      className="hb-contact-card"
    >
      {content}
    </div>
  );
})}
          </div>

        </div>

        {/* =========================
            COLUMNA DERECHA
        ========================= */}
        <div className="hb-partner-card">

          <h3 className="hb-partner-form-title">
            Quiero más información
            <span className="hb-rocket-icon"> 🚀</span>
          </h3>

          {submitted ? (
            <div
              className="hb-partner-success"
              role="status"
            >
              <p className="hb-partner-success-title">
                ¡Solicitud enviada con éxito!
              </p>

              <p className="hb-partner-success-desc">
                Nos pondremos en contacto contigo lo más pronto posible.
              </p>

              <button
                type="button"
                className="hb-btn-submit"
                onClick={() => {
                  setSubmitted(false);
                  setError(null);
                }}
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form
              className="hb-partner-form"
              onSubmit={(ev) => void handleSubmit(ev)}
              noValidate
            >

              {error && (
                <div
                  className="hb-form-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* =========================
                  FILA 1
              ========================= */}
              <div className="hb-field">

                
                <div className="hb-field">
                  <label htmlFor="ps-contact-name">
                    <RequiredLabel>
                      Nombre de contacto
                    </RequiredLabel>
                  </label>

                  <input
                    id="ps-contact-name"
                    name="contactName"
                    type="text"
                    autoComplete="name"
                    placeholder="Tu nombre completo"
                    value={form.contactName}
                    onChange={(ev) =>
                      patch({
                        contactName: ev.target.value,
                      })
                    }
                    disabled={busy}
                  />
                </div>

              </div>

              {/* =========================
                  FILA 2
              ========================= */}
              <div className="hb-form-row">

                <div className="hb-field">
                  <label htmlFor="ps-email">
                 
                      Email
                  
                  </label>

                  <input
                    id="ps-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@negocio.com"
                    value={form.email}
                    onChange={(ev) =>
                      patch({
                        email: ev.target.value,
                      })
                    }
                    disabled={busy}
                  />
                </div>

                <div className="hb-field">
                  <label htmlFor="ps-phone">
                    <RequiredLabel>
                      Teléfono
                    </RequiredLabel>
                  </label>

                  <input
                    id="ps-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+51 999 999 999"
                    value={form.phone}
                    onChange={(ev) =>
                      patch({
                        phone: ev.target.value,
                      })
                    }
                    disabled={busy}
                  />
                </div>

              </div>

              
              {/* =========================
                  MENSAJE
              ========================= */}
              <div className="hb-field hb-field--textarea">

                <label htmlFor="ps-message">
                  Mensaje (Opcional)
                </label>

                <textarea
                  id="ps-message"
                  name="message"
                  rows={3}
                  maxLength={PARTNER_SIGNUP_MESSAGE_MAX}
                  placeholder="Cuéntanos sobre tu negocio..."
                  value={form.message}
                  onChange={(ev) =>
                    patch({
                      message: ev.target.value,
                    })
                  }
                  disabled={busy}
                />

                <span
                  className="hb-char-count"
                  aria-live="polite"
                >
                  {messageCount} / {PARTNER_SIGNUP_MESSAGE_MAX}
                </span>

              </div>

              {/* =========================
                  BOTÓN
              ========================= */}
              <button
                type="submit"
                className="hb-btn-submit"
                disabled={!canSubmit || busy}
              >
                {busy
                  ? "Solicitando..."
                  : "Solicitar información"}

                <svg
                  className="hb-btn-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  </section>
);}
