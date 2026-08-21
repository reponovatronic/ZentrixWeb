import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LANDING_HEADER_NAV,
} from "@/presentation/content/landing_nav";
import { scrollToLandingHash } from "@/presentation/utils/landing_scroll";

function NavAnchor({ href, label }: { href: string; label: string }) {
  const location = useLocation();

  const isHash = href.startsWith("#");

  if (!isHash) {
    return <a href={href}>{label}</a>;
  }

  return (
    <a
      href={href}
      onClick={(e) => {
        if (location.pathname !== "/") return;

        e.preventDefault();
        scrollToLandingHash(href);
      }}
    >
      {label}
    </a>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="hb-header">
      <div className="hb-header-inner">

        {/* LOGO */}
        <Link
          to="/"
          className="hb-logo-row"
          aria-label="Zentrix inicio"
          onClick={closeMenu}
        >
          <img
            src="/logo_landing.svg"
            alt=""
            width={76}
            height={32}
          />

          <span className="hb-logo-text">ZENTRIX</span>
        </Link>

        {/* BOTÓN HAMBURGUESA - SOLO MÓVIL */}
        <button
          type="button"
          className={`hb-menu-toggle ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* CONTENIDO DEL MENÚ */}
        <div className={`hb-mobile-menu ${menuOpen ? "is-open" : ""}`}>

          <nav className="hb-nav" aria-label="Principal">
            {LANDING_HEADER_NAV.map((item) => (
              <NavAnchor
                key={item.href}
                href={item.href}
                label={item.label}
              />
            ))}
          </nav>

          <div className="hb-header-actions">
  <Link
    to="/partners"
    className="hb-btn hb-btn-solid"
    onClick={closeMenu}
  >
    Log in
  </Link>
</div>

        </div>

      </div>
    </header>
  );
}