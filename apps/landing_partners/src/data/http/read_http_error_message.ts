/** Mensaje legible desde cuerpo JSON típico (FastAPI `detail`, etc.) o texto plano. */
export async function readHttpErrorMessage(res: Response, bodyText: string): Promise<string> {
  try {
    const j = JSON.parse(bodyText) as Record<string, unknown>;
    const msg = j.message ?? j.detail ?? j.error;
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (Array.isArray(j.errors) && j.errors.length > 0) {
      const first = j.errors[0];
      if (first && typeof first === "object" && first !== null && "message" in first) {
        const m = (first as { message?: unknown }).message;
        if (typeof m === "string" && m.length > 0) return m;
      }
      return String(j.errors[0]);
    }
  } catch {
    /* texto plano */
  }
  if (bodyText.length > 0 && bodyText.length < 400) return bodyText;
  return res.statusText || `Error ${res.status}`;
}
