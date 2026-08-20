import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { partnerAuthenticatedJson } from "@/data/http/partner_authenticated_fetch";

export type PatchPartnerOrderStatusBody = {
  status: string;
  notes?: string;
};

export function resolvePartnerOrderStatusUrl(orderId: number): string {
  return resolveAuthApiPath(`/partners/orders/${orderId}/status`);
}

/**
 * `PATCH /partners/orders/{order_id}/status` — aceptar / rechazar / avanzar estado.
 * Cuerpo: `{ status, notes? }` (p. ej. `PREPARING`, `CANCELLED`).
 */
export async function patchPartnerOrderStatus(
  orderId: number,
  body: PatchPartnerOrderStatusBody,
  signal?: AbortSignal
): Promise<void> {
  const url = resolvePartnerOrderStatusUrl(orderId);
  await partnerAuthenticatedJson(url, {
    method: "PATCH",
    body: JSON.stringify({
      status: body.status,
      notes: body.notes ?? "",
    }),
    signal,
  });
}
