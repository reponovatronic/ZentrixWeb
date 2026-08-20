const FEATURES = [
  {
    icon: "📍",
    title: "Cloud & Arquitectura",
    text: "Diseño y migración de infraestructura robusta y escalable.",
    alt: "AWS, GCP, Serverless, APIs.",
  },
  {
    icon: "💳",
    title: "Desarrollo de Software",
    text: "Creación de aplicaciones a medida, enfocadas en rendimiento y experiencia de usuario.",
    alt: "Web Apps, Backend, Bases de Datos.",
  },
  {
    icon: "🔔",
    title: "Automatización & Low Code",
    text: "Optimización de flujos de trabajo corporativos para reducir tiempos operativos.",
    alt: "Power Apps, Power Automate.",
  },
  {
    icon: "📊",
    title: "Soporte & Servicios TI",
    text: "Mantenimiento preventivo y correctivo de hardware y optimización de sistemas.",
    alt: "Laptops, Mantenimiento TI.",
  },
  {
    icon: "▦",
    title: "Capacitación Tecnológica",
    text: "Formación especializada para equipos técnicos en tecnologías modernas.",
    alt: "Cloud, APIs, Arquitectura.",
  },
  {
    icon: "🛍️",
    title: "Consultoría Tecnológica",
    text: "Acompañamiento estratégico desde la identificación del problema hasta la implementación.",
    alt: "Estrategia, Implementación.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section className="hb-section hb-features" id="beneficios" aria-labelledby="hb-features-title">
      <p className="hb-section-eyebrow">Nuestros Servicios</p>
      <h2 className="hb-section-title" id="hb-features-title">
        Soluciones integrales diseñadas para impulsar la eficiencia y el crecimiento de tu
organización en la era digital.
      </h2>

      <div className="hb-features-grid">
        {FEATURES.map((f) => (
          <article key={f.title} className="hb-feature-card">
            <span className="hb-feature-icon" aria-hidden>
              {f.icon}
            </span>
            <h3 className="hb-feature-title">{f.title}</h3>
            <p className="hb-feature-text">{f.text}</p>
            <p className="hb-feature-text2">{f.alt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
