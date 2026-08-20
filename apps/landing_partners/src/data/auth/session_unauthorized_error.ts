/** Respuesta HTTP 401 en rutas autenticadas: la UI global muestra modal y cierra sesión. */
export class SessionUnauthorizedError extends Error {
  readonly status = 401 as const;
  constructor(message = "Sesión expirada o token inválido") {
    super(message);
    this.name = "SessionUnauthorizedError";
  }
}

export function isSessionUnauthorizedError(e: unknown): e is SessionUnauthorizedError {
  return e instanceof SessionUnauthorizedError;
}
