/** Solicitud de alta como partner (formulario landing → API). */
export type PartnerSignupRequest = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  businessTypeId: number;
  /** Máx. 500 caracteres; vacío si no aplica. */
  message: string;
};
