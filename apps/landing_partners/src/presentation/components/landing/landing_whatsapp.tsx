import { useState } from "react";

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const whatsappNumber = "+51935624189";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      return;
    }

    const message = encodeURIComponent(
      `Hola, soy ${name.trim()}. Mi número es ${phone.trim()}. Quiero saber más información sobre ZENTRIX.`
    );

    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      "_blank"
    );

    setIsOpen(false);
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        type="button"
        className="whatsapp-float"
        onClick={() => setIsOpen(true)}
        aria-label="Contactar por WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="whatsapp-icon"
        >
          <path
            fill="currentColor"
            d="M20.52 3.48A11.84 11.84 0 0 0 12.09 0C5.56 0 .25 5.31.25 11.84c0 2.09.55 4.13 1.6 5.93L.15 24l6.38-1.67a11.8 11.8 0 0 0 5.56 1.41h.01c6.52 0 11.83-5.31 11.83-11.84 0-3.17-1.23-6.15-3.41-8.42ZM12.1 21.73h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.84 9.84 0 0 1-1.51-5.23C2.19 6.4 6.62 1.97 12.09 1.97c2.65 0 5.14 1.03 7.02 2.92a9.87 9.87 0 0 1 2.91 7.03c0 5.46-4.44 9.81-9.92 9.81Zm5.41-7.37c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.08 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
          />
        </svg>
      </button>

      {/* MODAL */}
      {isOpen && (
        <div
          className="whatsapp-modal-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="whatsapp-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="whatsapp-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="whatsapp-modal-icon">
              <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="whatsapp-icon"
        >
          <path
            fill="currentColor"
            d="M20.52 3.48A11.84 11.84 0 0 0 12.09 0C5.56 0 .25 5.31.25 11.84c0 2.09.55 4.13 1.6 5.93L.15 24l6.38-1.67a11.8 11.8 0 0 0 5.56 1.41h.01c6.52 0 11.83-5.31 11.83-11.84 0-3.17-1.23-6.15-3.41-8.42ZM12.1 21.73h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.84 9.84 0 0 1-1.51-5.23C2.19 6.4 6.62 1.97 12.09 1.97c2.65 0 5.14 1.03 7.02 2.92a9.87 9.87 0 0 1 2.91 7.03c0 5.46-4.44 9.81-9.92 9.81Zm5.41-7.37c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.08 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
          />
        </svg>
            </div>

            <h2>¿Quieres más información?</h2>

            <p className="whatsapp-modal-description">
              Déjanos tus datos y te contactaremos por WhatsApp.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="whatsapp-field">
                <label htmlFor="whatsapp-name">
                  Nombre <span>*</span>
                </label>

                <input
                  id="whatsapp-name"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="whatsapp-field">
                <label htmlFor="whatsapp-phone">
                  Número de teléfono <span>*</span>
                </label>

                <input
                  id="whatsapp-phone"
                  type="tel"
                  placeholder="+51 999 999 999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="whatsapp-submit"
              >
                Continuar a WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function openWhatsApp(name: string, phone: string) {
  if (!name.trim() || !phone.trim()) {
    return;
  }

  const whatsappNumber = "51935624189";

  const message = encodeURIComponent(
    `Hola, soy ${name.trim()}. Mi número es ${phone.trim()}. Quiero saber más información sobre ZENTRIX.`
  );

  window.open(
    `https://wa.me/${whatsappNumber}?text=${message}`,
    "_blank"
  );
}