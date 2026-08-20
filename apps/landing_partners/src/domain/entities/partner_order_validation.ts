/**
 * Fila de historial de validación de recojo (mock hasta conectar API).
 */
export type PartnerPickupValidationRow = {
  id: string;
  /** Resultado de la validación en caja. */
  outcome: "success" | "failed";
  orderCode: string;
  customerInitial: string;
  avatarColor: string;
  customerMasked: string;
  productLabel: string;
  totalDisplay: string;
  statusLabel: "Exitoso" | "Fallido";
  timeRelative: string;
};
