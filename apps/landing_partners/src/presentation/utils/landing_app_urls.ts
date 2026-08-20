/** Enlaces de descarga (TestFlight / Play internal test → tiendas en producción). */
export function resolveGooglePlayUrl(): string {
  const url = import.meta.env.VITE_GOOGLE_PLAY_URL?.trim();
  return url && url.length > 0 ? url : "#";
}

export function resolveAppStoreUrl(): string {
  const url = import.meta.env.VITE_APP_STORE_URL?.trim();
  return url && url.length > 0 ? url : "#";
}
