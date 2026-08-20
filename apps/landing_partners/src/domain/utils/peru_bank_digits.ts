/** CCI Perú (código de cuenta interbancario): 20 dígitos numéricos. */
export const PE_CCI_DIGIT_LEN = 20;

/** Rango razonable para número de cuenta solo dígitos (según banco). */
export const PE_ACCOUNT_DIGITS_MIN = 6;
export const PE_ACCOUNT_DIGITS_MAX = 20;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export type PeruBankDigitsResult =
  | { ok: true; accountDigits: string; cciDigits: string }
  | { ok: false; message: string };

/** Valida y devuelve solo dígitos listos para el API. */
export function validatePeruBankAccountDigits(
  accountRaw: string,
  cciRaw: string
): PeruBankDigitsResult {
  const accountDigits = digitsOnly(accountRaw);
  const cciDigits = digitsOnly(cciRaw);

  if (accountDigits.length < PE_ACCOUNT_DIGITS_MIN) {
    return {
      ok: false,
      message: `El número de cuenta debe tener entre ${PE_ACCOUNT_DIGITS_MIN} y ${PE_ACCOUNT_DIGITS_MAX} dígitos.`,
    };
  }
  if (accountDigits.length > PE_ACCOUNT_DIGITS_MAX) {
    return {
      ok: false,
      message: `El número de cuenta no puede superar ${PE_ACCOUNT_DIGITS_MAX} dígitos.`,
    };
  }
  if (cciDigits.length !== PE_CCI_DIGIT_LEN) {
    return {
      ok: false,
      message: `El CCI debe tener exactamente ${PE_CCI_DIGIT_LEN} dígitos (solo números, sin espacios ni guiones).`,
    };
  }
  return { ok: true, accountDigits, cciDigits };
}
