/**
 * Catálogo de tipos de negocio para el perfil partner (selector en web).
 * Los `id` deben coincidir con los que espera el backend en `business_type_id`.
 */
export type PartnerBusinessTypeOption = {
  readonly id: number;
  readonly label: string;
};

export const PARTNER_BUSINESS_TYPE_OPTIONS: readonly PartnerBusinessTypeOption[] = [
  { id: 1, label: "Desarrollo de software" },
  { id: 2, label: "Consultoría tecnológica" },
  { id: 3, label: "Servicios de TI" },
  { id: 4, label: "Ciberseguridad" },
  { id: 5, label: "Cloud y DevOps" },
  { id: 6, label: "Inteligencia artificial y Machine Learning" },
  { id: 7, label: "Datos y analítica" },
  { id: 8, label: "Desarrollo web" },
  { id: 9, label: "Desarrollo de aplicaciones móviles" },
  { id: 10, label: "Diseño UX/UI y productos digitales" },
  { id: 11, label: "Automatización de procesos" },
  { id: 12, label: "Soporte y mantenimiento tecnológico" },
  { id: 13, label: "Otros" },
] as const;

export function partnerBusinessTypeLabelForId(id: number): string | undefined {
  return PARTNER_BUSINESS_TYPE_OPTIONS.find((o) => o.id === id)?.label;
}
