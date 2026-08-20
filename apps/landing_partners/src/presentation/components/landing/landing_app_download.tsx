import { LANDING_SECTION_IDS } from "@/presentation/content/landing_nav";
import {
  resolveAppStoreUrl,
  resolveGooglePlayUrl,
} from "@/presentation/utils/landing_app_urls";

export function LandingAppDownload() {
  const googlePlayUrl = resolveGooglePlayUrl();
  const appStoreUrl = resolveAppStoreUrl();

  return (
    <section
      className="hb-section hb-download"
      id={LANDING_SECTION_IDS.descargar}
      aria-labelledby="hb-download-title"
    >
      <p className="hb-section-eyebrow">DISPONIBLE AHORA</p>
      <h2 className="hb-section-title hb-download-title" id="hb-download-title">
        DESCARGA LA <span className="hb-accent">APP GRATIS</span>
      </h2>
      <p className="hb-download-lead">
        Disponible para iOS y Android. Encuentra una Happy Bag sorpresa cerca tuyo y
        empieza a ahorrar hoy mismo.
      </p>
      <div className="hb-store-row">
        <a
          className="hb-store-badge hb-store-badge--image"
          href={googlePlayUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Disponible en Google Play"
        >
          <img
            src="/landing/play_console.png"
            alt="Disponible en Google Play"
            width={200}
            height={60}
            decoding="async"
          />
        </a>
        <a
          className="hb-store-badge hb-store-badge--image"
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Descargar en el App Store"
        >
          <img
            src="/landing/app_store.png"
            alt="Descargar en el App Store"
            width={200}
            height={60}
            decoding="async"
          />
        </a>
      </div>
    </section>
  );
}
