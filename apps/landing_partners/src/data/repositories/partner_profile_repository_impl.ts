import type { PartnerProfileRepository } from "@/domain/repositories/partner_profile_repository";
import type { PartnerBankingPreview, PartnerProfile } from "@/domain/entities/partner_profile";
import {
  partnerPhotoUrlFromJson,
  resolvePartnerPhotoDisplayUrl,
} from "@/domain/utils/resolve_partner_photo_url";
import {
  getPartnerMeJson,
  patchPartnerPhoto,
  putPartnerMeJson,
} from "@/data/http/partner_me_client";

function str(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "string" && v.length > 0) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function optionalRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function coerceBool(j: Record<string, unknown>, keys: string[], defaultValue: boolean): boolean {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "boolean") return v;
    if (v === 1 || v === "1") return true;
    if (v === 0 || v === "0") return false;
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return defaultValue;
}

function numPart(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return "";
}

function timeForTimeInput(api: unknown): string {
  if (typeof api !== "string") return "";
  const s = api.trim();
  const m = s.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

function toPutTimeHms(display: string): string {
  const t = display.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  throw new Error("Horario inválido. Usa HH:mm.");
}

/**
 * Si GET no envía estos campos (solo en estado; no hay inputs visibles),
 * el PUT usa estos valores como plantilla del contrato del API.
 */
const PARTNER_ME_HIDDEN_DEFAULTS = {
  district_id: 1,
  department_id: 1,
  latitude: -12.1212,
  longitude: -77.0303,
} as const;

function intForBusinessTypePut(raw: string): number {
  const t = raw.trim();
  if (!t) {
    throw new Error("Selecciona el tipo de negocio.");
  }
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n)) {
    throw new Error("El tipo de negocio no es válido.");
  }
  return n;
}

function intForPut(raw: string, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

function floatForPut(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw.trim().replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function photoUrlFromPartnerJson(j: Record<string, unknown>): string {
  return partnerPhotoUrlFromJson(j);
}

/** GET devolvió `{}`/`null`/sin objeto: muestra todos los controles pero sin datos (excepto email en UI si viene de sesión). */
function emptyPartnerProfileFromApi(): PartnerProfile {
  return {
    id: "",
    photoUrl: "",
    businessName: "",
    businessType: "",
    businessTypeIdRaw: "",
    email: "",
    phone: "",
    address: "",
    districtIdRaw: "",
    departmentIdRaw: "",
    latitudeRaw: "",
    longitudeRaw: "",
    description: "",
    openingTime: "",
    closingTime: "",
    statusLabel: "",
    memberSinceLabel: "",
    ordersTotalDisplay: "",
    receiveOrders: false,
    notificationsEnabled: false,
    visibleOnMap: false,
    banking: null,
    bankAccountPersisted: false,
    bankName: "",
    bankAccountNumber: "",
    bankCci: "",
    bankHolder: "",
  };
}

function parseBankPreview(root: Record<string, unknown>): PartnerBankingPreview | null {
  const candidates = [
    root.banking_preview,
    root.banking_preview_data,
    root.payment_summary,
    root.banking,
    root.bank,
  ].map(optionalRecord);
  const b = candidates.find(Boolean) ?? null;
  if (!b) return null;

  const last = str(b, "last_payment", "lastPayment", "ultimo_pago", "Último pago").trim();
  const next = str(b, "next_payment", "nextPayment", "proximo_pago", "próximo_pago").trim();
  const amount = str(b, "amount_due", "amountDue", "monto_a_pagar", "monto", "amount").trim();
  const bankSummary = str(
    b,
    "bank_name",
    "bankName",
    "banco_label",
    "banco_summary",
    "banco",
    "summary"
  );

  const hasAny =
    last.length +
      next.length +
      amount.length +
      bankSummary.length +
      str(b, "tipo_cuenta", "account_type", "accountType").length >
    0;
  if (!hasAny) return null;

  return {
    lastPaymentLabel: last,
    nextPaymentLabel: next,
    amountLabel: amount,
    bankSummary,
    accountType: str(b, "tipo_cuenta", "account_type", "accountType") || undefined,
    accountNumberMasked: str(b, "numero_cuenta", "account_number_masked", "accountNumber") || undefined,
    cciMasked: str(b, "cci", "cci_masked", "cciMasked") || undefined,
    holderName: str(b, "titular", "holder", "holder_name", "holderName") || undefined,
  };
}

export function partnerProfileFromJson(j: Record<string, unknown>): PartnerProfile {
  if (Object.keys(j).length === 0) {
    return emptyPartnerProfileFromApi();
  }

  const ordersRaw = j.orders_total ?? j.total_orders ?? j.order_count ?? j.ordersCount;
  let ordersTotalDisplay = "";
  if (typeof ordersRaw === "number" && Number.isFinite(ordersRaw)) {
    ordersTotalDisplay = ordersRaw.toLocaleString("es-PE");
  } else {
    ordersTotalDisplay = str(j, "orders_total_display", "ordersTotalDisplay", "total_orders_label");
  }

  const banking = parseBankPreview(j);

  const bt = optionalRecord(j.business_type) ?? optionalRecord(j.businessType);
  const businessTypeFallback =
    typeof j.business_type === "string" ? String(j.business_type).trim() : "";

  let businessType = "";
  if (bt) {
    businessType = str(bt, "name", "title", "label", "type_name");
  }
  if (!businessType) businessType = businessTypeFallback;
  if (!businessType) {
    businessType = str(
      j,
      "business_type_name",
      "businessTypeName",
      "category",
      "tipo_negocio",
      "partner_type"
    );
  }

  let businessTypeIdRaw = numPart(j, "business_type_id", "businessTypeId");
  if (!businessTypeIdRaw && bt) businessTypeIdRaw = numPart(bt, "id");

  const geo = optionalRecord(j.location) ?? optionalRecord(j.geo);

  return {
    id: str(j, "id", "partner_id", "partnerId"),
    photoUrl: photoUrlFromPartnerJson(j),
    businessName: str(
      j,
      "business_name",
      "businessName",
      "full_name",
      "fullName",
      "commercial_name",
      "name"
    ),
    businessType,
    businessTypeIdRaw,
    email: str(j, "email", "contact_email", "contactEmail"),
    phone: str(j, "phone", "telefono", "phone_number", "phoneNumber"),
    address: str(j, "address", "direccion", "full_address", "fullAddress"),
    districtIdRaw: numPart(j, "district_id", "districtId") || (geo ? numPart(geo, "district_id", "districtId") : ""),
    departmentIdRaw:
      numPart(j, "department_id", "departmentId") ||
      (geo ? numPart(geo, "department_id", "departmentId") : ""),
    latitudeRaw:
      numPart(j, "latitude", "lat") || (geo ? numPart(geo, "latitude", "lat") : ""),
    longitudeRaw:
      numPart(j, "longitude", "lng", "lon") ||
      (geo ? numPart(geo, "longitude", "lng", "lon") : ""),
    description: str(j, "description", "descripcion", "bio"),
    openingTime:
      timeForTimeInput(
        typeof j.opening_time === "string"
          ? j.opening_time
          : typeof j.openingTime === "string"
            ? j.openingTime
            : undefined
      ) || timeForTimeInput(str(j, "opening_time", "openingTime", "hora_apertura", "open_at")),
    closingTime:
      timeForTimeInput(
        typeof j.closing_time === "string"
          ? j.closing_time
          : typeof j.closingTime === "string"
            ? j.closingTime
            : undefined
      ) ||
      timeForTimeInput(str(j, "closing_time", "closingTime", "hora_cierre", "close_at")),
    statusLabel: str(j, "status_label", "statusLabel", "status", "estado").replace(/_/g, " "),
    memberSinceLabel: str(
      j,
      "member_since",
      "memberSince",
      "miembro_desde",
      "created_at_label",
      "createdAtLabel"
    ),
    ordersTotalDisplay,
    receiveOrders: coerceBool(
      j,
      [
        "receive_orders",
        "receiveOrders",
        "recibir_ordenes",
        "accepts_orders",
        "acceptOrders",
      ],
      true
    ),
    notificationsEnabled: coerceBool(
      j,
      ["notifications_enabled", "notificationsEnabled", "notificaciones"],
      true
    ),
    visibleOnMap: coerceBool(
      j,
      ["visible_on_map", "visibleOnMap", "map_visible", "visible_mapa"],
      true
    ),
    banking,
    bankAccountPersisted: false,
    bankName: str(j, "bank_name_request", "bankNameRequest", "new_bank_name", "bank_name_edit") ||
      str(j, "bank_name", "bankName", "banco"),
    bankAccountNumber: str(
      j,
      "bank_account_number_request",
      "bankAccountNumberRequest",
      "new_account_number",
      "account_number"
    ),
    bankCci: str(j, "bank_cci_request", "bankCciRequest", "new_cci", "cci"),
    bankHolder: str(
      j,
      "bank_holder_request",
      "bankHolderRequest",
      "account_holder",
      "titular_cuenta",
      "titular"
    ),
  };
}

export function partnerBusinessToPutBody(p: PartnerProfile): Record<string, unknown> {
  return {
    business_name: p.businessName.trim(),
    business_type_id: intForBusinessTypePut(p.businessTypeIdRaw),
    phone: p.phone.trim(),
    address: p.address.trim(),
    district_id: intForPut(p.districtIdRaw, PARTNER_ME_HIDDEN_DEFAULTS.district_id),
    department_id: intForPut(p.departmentIdRaw, PARTNER_ME_HIDDEN_DEFAULTS.department_id),
    latitude: floatForPut(p.latitudeRaw, PARTNER_ME_HIDDEN_DEFAULTS.latitude),
    longitude: floatForPut(p.longitudeRaw, PARTNER_ME_HIDDEN_DEFAULTS.longitude),
    description: p.description.trim(),
    opening_time: toPutTimeHms(p.openingTime),
    closing_time: toPutTimeHms(p.closingTime),
  };
}

export class PartnerProfileRepositoryImpl implements PartnerProfileRepository {
  async fetchMe(abortSignal?: AbortSignal): Promise<PartnerProfile> {
    const j = await getPartnerMeJson(abortSignal);
    return partnerProfileFromJson(j);
  }

  async updateMe(profile: PartnerProfile): Promise<PartnerProfile> {
    await putPartnerMeJson(partnerBusinessToPutBody(profile));
    return this.fetchMe();
  }

  async uploadPhoto(file: File, abortSignal?: AbortSignal): Promise<PartnerProfile> {
    const uploadedUrl = await patchPartnerPhoto(file, abortSignal);
    const profile = await this.fetchMe(abortSignal);
    if (profile.photoUrl.trim()) return profile;
    if (uploadedUrl.trim()) {
      return { ...profile, photoUrl: resolvePartnerPhotoDisplayUrl(uploadedUrl) };
    }
    return profile;
  }
}
