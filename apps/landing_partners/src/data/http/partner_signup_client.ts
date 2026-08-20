import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";

/**
 * Ruta del POST de solicitud partner (ajustar cuando el backend confirme el contrato).
 * Ej.: `POST /partners/applications`
 */
export const PARTNER_SIGNUP_API_PATH = "/partners/applications";

function partnerSignupLog(label: string, ...rest: unknown[]): void {
  if (import.meta.env.DEV) {
    console.log("[partner-signup]", label, ...rest);
  }
}

export function resolvePartnerSignupUrl(): string {
  return resolveAuthApiPath(PARTNER_SIGNUP_API_PATH);
}

export type PartnerSignupApiBody = {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  business_type_id: number;
  message?: string;
};

export async function postPartnerSignupRequestJson(
  body: PartnerSignupApiBody,
  signal?: AbortSignal
): Promise<void> {
  const url = resolvePartnerSignupUrl();
  const started = performance.now();
  partnerSignupLog("POST", url, body);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw e instanceof Error ? e : new Error(String(e));
  }

  const text = await res.text();
  partnerSignupLog(
    "response POST",
    res.status,
    `${Math.round(performance.now() - started)} ms`,
    text.length > 280 ? `${text.slice(0, 280)}…` : text
  );

  if (!res.ok) {
    throw new Error(await readHttpErrorMessage(res, text));
  }
}
