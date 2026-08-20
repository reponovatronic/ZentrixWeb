import { useEffect, useState } from "react";
import { LANDING_SECTION_IDS } from "@/presentation/content/landing_nav";
import { scrollToLandingHash } from "@/presentation/utils/landing_scroll";

const heroImages = [
  "/landing/hero.png",
  "/landing/hero2.png",
  "/landing/hero3.png",
];

export function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hb-hero" id="Inicio">

      {/* =========================
          CARRUSEL DE FONDO
          ========================= */}
      <div className="hb-hero-background" aria-hidden="true">
        {heroImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt=""
            className={`hb-background-image ${
              index === currentImage
                ? "hb-background-image-active"
                : ""
            }`}
          />
        ))}
      </div>

      {/* =========================
          CAPA TRANSPARENTE
          ========================= */}
      <div
        className="hb-hero-overlay "
        aria-hidden="true"
      />

      {/* =========================
          CONTENIDO
          ========================= */}
      <div className="hb-hero-copy hb-glass-card">

        <p className="hb-badge">
          <span aria-hidden="true">🔵</span>
          TECNOLOGÍA PARA EL SIGUIENTE NIVEL.
        </p>

        <h1 className="hb-title">
          <span className="hb-title-line">
            Transformamos
            <span className="hb-accent"> Ideas</span> en
          </span>

          <span className="hb-title-line">
            <span className="hb-accent">
              Soluciones Digitales.
            </span>
          </span>
        </h1>

        <p className="hb-sub">
          Diseñamos e implementamos soluciones de software, cloud,
          automatización e infraestructura tecnológica para ayudar a
          empresas y emprendedores a optimizar sus procesos, innovar y crecer.
        </p>

        {/* BOTONES */}
        <div className="hb-cta-row">

          <a
            className="hb-btn2 hb-btn2-solid hb-btn2-lg"
            href={`#${LANDING_SECTION_IDS.Contacto}`}
            onClick={(e) => {
              if (window.location.pathname !== "/") return;

              e.preventDefault();

              scrollToLandingHash(
                `#${LANDING_SECTION_IDS.Servicios}`
              );
            }}
          >
            Hablemos de tu proyecto
            <span className="btn-flecha" aria-hidden="true">
              →
            </span>
          </a>

          <a
            className="hb-btn hb-btn-solid hb-btn-lg"
            href={`#${LANDING_SECTION_IDS.Contacto}`}
            onClick={(e) => {
              if (window.location.pathname !== "/") return;

              e.preventDefault();

              scrollToLandingHash(
                `#${LANDING_SECTION_IDS.Servicios}`
              );
            }}
          >
            Conoce nuestros servicios
          </a>

        </div>

        

      </div>

    </section>
  );
}