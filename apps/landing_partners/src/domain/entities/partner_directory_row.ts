/** Fila del directorio «Partners» en el portal administrador. */

export type PartnerDirectoryStatus = "active" | "pending" | "inactive";

export type PartnerDirectoryRow = {
  id: string;
  businessName: string;
  email: string;
  /** Tipo de negocio (p. ej. `business_type` del API). */
  category: string;
  status: PartnerDirectoryStatus;
  joinedAtLabel: string;
  initial: string;
  avatarColor: string;
  /** Titular / contacto opcional (búsqueda y futuras columnas). */
  ownerName?: string;
  /** Opcional para búsqueda. */
  phone?: string;
  /** Ítem tal como lo representamos desde el API (para vista detalle en bruto). */
  listItemRaw?: Record<string, unknown>;
};
