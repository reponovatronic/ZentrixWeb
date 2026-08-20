/** Evento global: cualquier capa `data` puede emitirlo sin importar stores de UI. */
export const HB_SESSION_UNAUTHORIZED = "hb:session-unauthorized";

export function emitSessionUnauthorized(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HB_SESSION_UNAUTHORIZED));
}
