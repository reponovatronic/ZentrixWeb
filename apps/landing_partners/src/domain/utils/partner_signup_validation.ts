import type { PartnerSignupRequest } from "@/domain/entities/partner_signup_request";
import { PARTNER_BUSINESS_TYPE_OPTIONS } from "@/domain/catalog/partner_business_type_catalog";

export const PARTNER_SIGNUP_MESSAGE_MAX = 500;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Devuelve el primer error de validación o `null` si el payload es válido. */
export function validatePartnerSignupRequest(
  data: PartnerSignupRequest
): string | null {
  
  if (!data.contactName.trim()) {
    return "Ingresa el nombre de contacto.";
  }
  if (!isValidEmail(data.email)) {
    return "Ingresa un correo válido.";
  }
  if (!data.phone.trim() || data.phone.trim().length < 6) {
    return "Ingresa un teléfono válido.";
  }
  
  if (data.message.length > PARTNER_SIGNUP_MESSAGE_MAX) {
    return `El mensaje no puede superar ${PARTNER_SIGNUP_MESSAGE_MAX} caracteres.`;
  }
  return null;
}
