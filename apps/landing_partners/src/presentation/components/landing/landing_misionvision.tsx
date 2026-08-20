const PILLARS = [
  {
    title: "Misión",
    text: "Proveer soluciones tecnológicas integrales y personalizadas que impulsen la transformación digital, optimizando procesos y potenciando el crecimiento sostenible de nuestros clientes a través de innovación constante y excelencia técnica.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
  },
  {
    title: "Visión",
    text: "Ser el socio estratégico líder en consultoría y desarrollo tecnológico a nivel regional, reconocidos por nuestra capacidad de anticipar tendencias, entregar valor medible y construir arquitecturas digitales robustas para el futuro empresarial.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
] as const;

export function LandingMissionVision() {
  return (
    <section className="mv-section" id="mision-vision">
      <div className="mv-container">
        
        {/* Frase / Título Principal */}
        <h2 className="mv-quote-title">
          "Convertimos necesidades de negocio <br />
          en <span className="mv-highlight">soluciones tecnológicas.</span>"
        </h2>

        {/* Grid de Misión y Visión */}
        <div className="mv-grid">
          {PILLARS.map((item) => (
            <article key={item.title} className="mv-card">
              <div className="mv-icon-box" aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="mv-card-title">{item.title}</h3>
              <p className="mv-card-text">{item.text}</p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}