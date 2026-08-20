function apiBaseUrlForResolvedImages(): string {
  const raw = (import.meta.env.VITE_AUTH_API_URL ?? "").trim().replace(/\/$/, "");
  if (raw) return raw;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function resolvePartnerPhotoDisplayUrl(pathOrUrl: string): string {
  const path = pathOrUrl.trim();
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  try {
    const base = apiBaseUrlForResolvedImages();
    const baseUri = new URL(base.endsWith("/") ? base : `${base}/`);
    return new URL(path.startsWith("/") ? path.slice(1) : path, baseUri).toString();
  } catch {
    return path;
  }
}

function strFromRecord(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Extrae y resuelve la URL de foto desde JSON de sesión o `GET /partners/me`. */
export function partnerPhotoUrlFromJson(j: Record<string, unknown>): string {
  const raw = strFromRecord(
    j,
    "photo_url",
    "photoUrl",
    "profile_photo_url",
    "profilePhotoUrl",
    "avatar_url",
    "avatarUrl",
    "profile_photo",
    "profilePhoto",
    "profile_image",
    "profileImage",
    "photo",
    "image_url",
    "imageUrl"
  );
  return resolvePartnerPhotoDisplayUrl(raw);
}
