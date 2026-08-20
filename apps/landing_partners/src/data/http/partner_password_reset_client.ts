import { resolveAuthApiPath } from "@/data/http/partner_auth_client";

async function readErrorMessage(
  res: Response,
  bodyText: string
): Promise<string> {
  try {
    const j = JSON.parse(bodyText) as Record<string, unknown>;
    const msg = j.message ?? j.detail ?? j.error;
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (Array.isArray(j.errors)) return String(j.errors[0]);
  } catch {
    /* texto plano */
  }
  if (bodyText.length > 0 && bodyText.length < 400) return bodyText;
  return res.statusText || `Error ${res.status}`;
}

/** Igual que Flutter: `POST /auth/forgot-password` + `{ email }`. */
export async function postForgotPasswordAuth(email: string): Promise<void> {
  const url = resolveAuthApiPath("/auth/forgot-password");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: email.trim() }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, text));
  }
}

/** Igual que Flutter: `POST /auth/reset-password` + token + new_password + confirm_password. */
export async function postResetPasswordAuth(params: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const url = resolveAuthApiPath("/auth/reset-password");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      token: params.token.trim(),
      new_password: params.newPassword,
      confirm_password: params.confirmPassword,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, text));
  }
}
