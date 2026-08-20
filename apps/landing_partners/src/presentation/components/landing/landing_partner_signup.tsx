import type { PartnerSignupRequest } from "@/domain/entities/partner_signup_request";
import { PARTNER_SIGNUP_MESSAGE_MAX } from "@/domain/utils/partner_signup_validation";
import { PartnerSignupRepositoryImpl } from "@/data/repositories/partner_signup_repository_impl";

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
    title: "WhatsApp",
    text: "Respuesta inmediata",
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
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    title: "Facebook",
    text: "Síguenos en redes",
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
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    title: "Llámanos",
    text: "+51 999 999 999",
  },
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
      form.email.trim().length > 0 &&
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

    const payload: PartnerSignupRequest = {
      ...form,
      businessTypeId: Number.parseInt(businessTypeIdRaw, 10),
    };

    setBusy(true);
    setError(null);
    try {
      await signupRepo.submitRequest(payload);
      setSubmitted(true);
      setForm(EMPTY_FORM);
      setBusinessTypeIdRaw("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la solicitud. Intenta de nuevo."
      );
    } finally {
      setBusy(false);
    }
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
            {CONTACT_METHODS.map((item) => (
              <div
                key={item.title}
                className="hb-contact-card"
              >
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
              </div>
            ))}
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
                    <RequiredLabel>
                      Email
                    </RequiredLabel>
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
