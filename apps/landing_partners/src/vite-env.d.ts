/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base absoluta del API de auth (sin barra final).
   * Build: se inyecta en el cliente. Dev: solo la usa el proxy de Vite; el código llama rutas `/auth/*`.
   */
  readonly VITE_AUTH_API_URL?: string;

  /** Clave Maps JavaScript API (perfil partner: picker de dirección). */
  readonly VITE_GOOGLE_API_KEY?: string;

  /**
   * Map ID para Advanced Markers (Cloud Console → Map Management). Opcional; si falta usamos DEMO_MAP_ID.
   */
  readonly VITE_GOOGLE_MAP_ID?: string;

  /** TestFlight / App Store (beta o producción). */
  readonly VITE_APP_STORE_URL?: string;

  /** Google Play internal test o ficha en tienda. */
  readonly VITE_GOOGLE_PLAY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
