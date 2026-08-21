import { Link } from "react-router-dom";


export function LandingFooter() {
  return (
    <footer className="hb-footer">
      <div className="hb-footer-content">

        {/* LOGOTIPO */}
        <div className="hb-footer-brand">
          <Link
            to="/"
            className="hb-logo-row"
            aria-label="ZENTRIX inicio"
          >
            <img
              src="/logo_landing.svg"
              alt="ZENTRIX"
              width={76}
              height={32}
            />

            <span className="hb-logo-text">ZENTRIX</span>
          </Link>
        </div>

        {/* COPYRIGHT */}
        <div className="hb-footer-copyright">
          <p>
            © 2026 ZENTRIX LATAM E.I.R.L. Lima, Perú. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}