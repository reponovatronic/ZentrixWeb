import { LANDING_FAQ_ITEMS } from "@/presentation/content/landing_faq_content";
import { LANDING_SECTION_IDS } from "@/presentation/content/landing_nav";
import { useId, useState } from "react";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={open ? "hb-faq-chevron hb-faq-chevron--open" : "hb-faq-chevron"}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingFaq() {
  const baseId = useId();
  const [openId, setOpenId] = useState<string>(LANDING_FAQ_ITEMS[0]?.id ?? "");

  return (
    <section
      className="hb-section hb-faq"
      id={LANDING_SECTION_IDS.Proyectos}
      aria-labelledby="hb-faq-title"
    >
      <p className="hb-section-eyebrow">PREGUNTAS FRECUENTES</p>
      <h2 className="hb-section-title" id="hb-faq-title">
        ¿TIENES <span className="hb-accent">DUDAS?</span>
      </h2>

      <div className="hb-faq-list">
        {LANDING_FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          const panelId = `${baseId}-${item.id}-panel`;
          const buttonId = `${baseId}-${item.id}-button`;
          return (
            <div key={item.id} className="hb-faq-item">
              <h3 className="hb-faq-item-head">
                <button
                  type="button"
                  id={buttonId}
                  className="hb-faq-trigger"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? "" : item.id)}
                >
                  <span>{item.question}</span>
                  <Chevron open={isOpen} />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={isOpen ? "hb-faq-panel hb-faq-panel--open" : "hb-faq-panel"}
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
