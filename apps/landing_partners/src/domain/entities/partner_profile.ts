/**
 * Perfil público/detalle del socio consumido desde `GET /partners/me`.
 * El backend puede devolver snake_case o camelCase; el mapeo en datos lo tolera.
 */
export type PartnerBankingPreview = {
  lastPaymentLabel: string;
  nextPaymentLabel: string;
  amountLabel: string;
  bankSummary: string;
  accountType?: string;
  accountNumberMasked?: string;
  cciMasked?: string;
  holderName?: string;
};

export type PartnerProfile = {
  id: string;
  /** URL absoluta o relativa de la foto de perfil (`GET /partners/me` o `PATCH /partners/photo`). */
  photoUrl: string;
  businessName: string;
  /** Texto amigable p. ej. nombre del tipo desde el API (`business_type.name`). */
  businessType: string;
  /** Valor tal cual para `business_type_id` en el PUT. */
  businessTypeIdRaw: string;
  /** Email desde GET/sesión; no se incluye en el cuerpo PUT del negocio. */
  email: string;
  phone: string;
  address: string;
  districtIdRaw: string;
  departmentIdRaw: string;
  latitudeRaw: string;
  longitudeRaw: string;
  description: string;
  /** `HH:mm` compatible con `<input type="time" />`; se envía como `HH:mm:ss`. */
  openingTime: string;
  closingTime: string;
  statusLabel: string;
  /** Texto solo lectura (“Enero 2025”, fecha ISO ya formateada en backend, etc.) */
  memberSinceLabel: string;
  ordersTotalDisplay: string;
  receiveOrders: boolean;
  notificationsEnabled: boolean;
  visibleOnMap: boolean;
  banking: PartnerBankingPreview | null;
  /**
   * Cuenta bancaria vía `GET|POST|PUT /bank-accounts`.
   * Si es true, el guardado usa PUT; si false, POST (primera alta).
   */
  bankAccountPersisted: boolean;
  /** Nombre del banco (referencia en pantalla; el envío al API usa el catálogo centralizado). */
  bankName: string;
  bankAccountNumber: string;
  bankCci: string;
  bankHolder: string;
};
