import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "#",
  },
  {
    label: "Twitter",
    href: "#",
  },
  {
    label: "GitHub",
    href: "#",
  },
  {
    label: "Email",
    href: "ventas@zentrixlatam.com",
  },
  {
    label: "WhatsApp",
    href: "+51935624189",
  },
] as const;

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
            © 2024 ZENTRIX TECH E.I.R.L. Lima, Perú. All rights reserved.
          </p>
        </div>

        {/* CONTACTO Y REDES */}
        <div className="hb-footer-social">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="hb-footer-social-link"
              target={
                social.label === "Email" ? undefined : "_blank"
              }
              rel={
                social.label === "Email"
                  ? undefined
                  : "noopener noreferrer"
              }
            >
              {social.label}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}