/** Id numérico de socio esperado por `partner_id` en rutas `/admin/*` y similares. */
export function parsePartnerApiNumericId(partnerId: string | undefined | null): number | null {
  const raw = typeof partnerId === "string" ? partnerId.trim() : "";
  if (!raw) return null;
  const direct = Number.parseInt(raw, 10);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const digits = raw.match(/\d+/);
  if (digits) {
    const n = Number.parseInt(digits[0], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}
