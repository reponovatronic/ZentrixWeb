import { useState, useEffect } from "react";

const TECH_STACK = [
  { name: "AWS & GCP", icon: "☁️" },
  { name: "Python & .NET", icon: "{ }" },
  { name: "React", icon: "⚛️" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Serverless", icon: "⚡" },
  { name: "Power Platform", icon: "▦" },
];

const HERO_SLIDES = [
  "/landing/hero.png",
  "/landing/hero2.png",
  "/landing/hero3.png",
];

const CLIENT_LOGOS = [
  "/landing/logo1.png",
  "/landing/logo2.png",
  "/landing/logo3.png",
  "/landing/logo4.png",
  "/landing/logo5.png",
  "/landing/logo6.png",
];

export function LandingHowItWorks() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carrusel clientes
  const [currentClient, setCurrentClient] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        return (prev + 1) % HERO_SLIDES.length;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // CARRUSEL INFERIOR
  // =========================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClient((prev) => {
        return (prev + 1) % CLIENT_LOGOS.length;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="tech-section"
      id="como-funciona"
      aria-labelledby="tech-title"
    >

      <div className="tech-container">

        {/* =====================================================
            FILA SUPERIOR
           ===================================================== */}

        <div className="tech-main-grid">

          {/* =========================
              COLUMNA IZQUIERDA
             ========================= */}

          <div className="tech-info">

            <h2 className="tech-title" id="tech-title">
              Tecnología, experiencia y soluciones
            </h2>

            <p className="tech-desc">
              En <strong>ZENTRIX TECH</strong>, no solo escribimos código;
              convertimos las necesidades reales de tu negocio en soluciones
              eficientes y escalables. Nuestro enfoque integral asegura que
              cada pieza tecnológica se alinee con tus objetivos estratégicos.
            </p>

            <p className="tech-highlight">
              +6 años de experiencia.
            </p>

            {/* Tecnologías */}

            <div className="tech-badges">

              {TECH_STACK.map((tech) => (

                <span
                  key={tech.name}
                  className="tech-badge"
                >

                  <span className="badge-pipe">
                    |
                  </span>

                  <span className="badge-icon">
                    {tech.icon}
                  </span>

                  <span>
                    {tech.name}
                  </span>

                </span>

              ))}

            </div>

          </div>


          {/* =========================
              GALERÍA SUPERIOR
             ========================= */}

          <div className="tech-carousel">

            <div className="carousel-window">

              {HERO_SLIDES.map((image, index) => (

                <img
                  key={image}
                  src={image}
                  alt={`Tecnología e innovación ${index + 1}`}
                  className={`carousel-img ${
                    currentSlide === index
                      ? "carousel-img-active"
                      : ""
                  }`}
                />

              ))}

              {/* Indicadores */}

              <div className="carousel-dots">

                {HERO_SLIDES.map((_, index) => (

                  <button
                    key={index}
                    type="button"
                    className={`dot ${
                      currentSlide === index
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Mostrar imagen ${index + 1}`}
                  />

                ))}

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            CLIENTES
           ===================================================== */}

        <div className="tech-clients-section">

          <h3 className="clients-title">
            Más de 300 empresas eligieron tener el control en sus manos
          </h3>

          {/* =========================
              CARRUSEL CLIENTES
             ========================= */}

          <div className="clients-slider">

            <div className="clients-window">

              <div className="clients-track">

                {Array.from({ length: 5 }).map((_, index) => {

                  const logoIndex =
                    (currentClient + index) % CLIENT_LOGOS.length;

                  const client =
                    CLIENT_LOGOS[logoIndex];

                  return (
                    <div
                      key={`${client}-${index}`}
                      className="client-card"
                    >

                      <img
                        src={client}
                        alt={`Cliente ${logoIndex + 1}`}
                      />

                    </div>
                  );

                })}

              </div>

            </div>


            {/* =========================
                INDICADORES
               ========================= */}

            <div className="clients-dots">

              {CLIENT_LOGOS.map((_, index) => (

                <button
                  key={index}
                  type="button"
                  className={`dot ${
                    currentClient === index
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setCurrentClient(index)}
                  aria-label={`Mostrar cliente ${index + 1}`}
                />

              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}