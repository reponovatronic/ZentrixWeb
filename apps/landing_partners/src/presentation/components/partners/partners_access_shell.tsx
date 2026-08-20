import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type PartnersAccessShellProps = {
  children: ReactNode;
  /** Enlace opcional arriba a la derecha del aside (p.ej. sitio público). */
  topRightLink?: { to: string; label: string };
};

export function PartnersAccessShell({
  children,
  topRightLink,
}: PartnersAccessShellProps) {
  return (
    <div className="ps-access">
      <section className="ps-access-hero" aria-label="Happy Bag Partners">
        <div className="ps-access-hero-bg" aria-hidden />
        <div className="ps-access-hero-inner">
          <div className="ps-access-brand">
            <img
            src="/logo_landing.svg"
            alt=""
            width={76}
            height={32}
          />
          </div>
          <div>
            <h2 className="ps-access-headline">
              <span className="ps-accent">EL FUTURO</span>
              <span className="ps-muted">DE TU</span>
              <span className="ps-accent">GESTIÓN</span>
            </h2>
            <p className="ps-access-lead">
              Más que una plataforma, somos tu socio tecnológico. 
              Gestiona, innova y escala sin límites desde un solo lugar.
            </p>
          </div>
          <dl className="ps-access-stats">
            <div className="ps-access-stat">
              <dt>Soluciones</dt>
              <dd>+500</dd>
            </div>
            <div className="ps-access-stat">
              <dt>Native</dt>
              <dd>CLOUD</dd>
            </div>
          </dl>
        </div>
      </section>

      <aside className="ps-access-aside">
        {topRightLink ? (
          <Link className="ps-access-back" to={topRightLink.to}>
            {topRightLink.label}
          </Link>
        ) : null}
        {children}
      </aside>
    </div>
  );
}
