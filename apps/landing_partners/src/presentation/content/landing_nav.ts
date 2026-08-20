/** Anclas del landing para header, footer y CTAs. */
export const LANDING_SECTION_IDS = {
  Inicio: "Inicio",
  Nosotros: "como-funciona",
  MisionVision: "mision-vision",
  Servicios: "beneficios",
  Contacto:"partners",
} as const;

export type LandingNavItem = {
  label: string;
  href: string;
};

export const LANDING_HEADER_NAV: readonly LandingNavItem[] = [
  { label: "Inicio", href: `#${LANDING_SECTION_IDS.Inicio}` },
  { label: "Nosotros", href: `#${LANDING_SECTION_IDS.Nosotros}` },
  { label: "Misión y Visión", href: `#${LANDING_SECTION_IDS.MisionVision}` },
  { label: "Servicios", href: `#${LANDING_SECTION_IDS.Servicios}` },
  { label: "Contacto", href: `#${LANDING_SECTION_IDS.Contacto}` },
] as const;
