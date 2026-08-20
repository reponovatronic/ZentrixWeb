import { getAccessToken } from "@/data/auth/partner_auth_session_storage";
import { SessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { emitSessionUnauthorized } from "@/data/auth/session_unauthorized_events";
import { resolveAuthApiPath } from "@/data/http/partner_auth_client";
import { devLoggedFetch } from "@/data/http/dev_http_log";
import { isPortalAdminApiMode } from "@/data/http/portal_api_mode";
import { readHttpErrorMessage } from "@/data/http/read_http_error_message";
import { parsePartnerApiNumericId } from "@/domain/utils/partner_api_id";
import {
  categoryDraftIdFromApiId,
  PARTNER_PRODUCT_CATEGORIES,
  type PartnerProductListRow,
  type PartnerProductsPageResult,
} from "@/domain/entities/partner_product";

/** Admin impersonando socio: algunos endpoints aceptan `partner_id`. */
function withAdminPartnerScope(url: string, scopedPartnerId?: string): string {
  const n = parsePartnerApiNumericId(scopedPartnerId);
  if (!isPortalAdminApiMode() || n == null) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}partner_id=${n}`;
}

function authJsonHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sesión cerrada o sin token.");
  }
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Bearer sin cuerpo (GET/DELETE). */
function authBearerHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sesión cerrada o sin token.");
  }
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Sin `Content-Type`: el navegador añade el boundary del multipart. */
function authMultipartHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sesión cerrada o sin token.");
  }
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function resolveProductsPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  /** En dev: mismo origen → proxy Vite (`/products/*`) y logs del servidor. */
  if (import.meta.env.DEV) {
    return resolveAuthApiPath(p);
  }
  const base = (import.meta.env.VITE_AUTH_API_URL ?? "").trim().replace(/\/$/, "");
  if (base.length > 0) {
    return `${base}${p}`;
  }
  return resolveAuthApiPath(p);
}

async function handleUnauthorized(res: Response, text: string): Promise<never> {
  emitSessionUnauthorized();
  throw new SessionUnauthorizedError(await readHttpErrorMessage(res, text));
}

function readIntDynamic(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string") return parseInt(v.trim(), 10) || null;
  return null;
}

function categoryApiIdFromProductJson(json: Record<string, unknown>): number | null {
  const top =
    readIntDynamic(json.category_id) ??
    readIntDynamic(json.categoryId) ??
    readIntDynamic(json.product_category_id);
  if (top != null) return top;
  const cat = json.category;
  if (typeof cat === "number" && Number.isFinite(cat)) return Math.trunc(cat);
  if (cat && typeof cat === "object" && !Array.isArray(cat)) {
    const c = cat as Record<string, unknown>;
    return readIntDynamic(c.id) ?? readIntDynamic(c.category_id);
  }
  return null;
}

/** Origen del API para resolver rutas relativas de imágenes (como Dio en Flutter). */
function apiBaseUrlForResolvedImages(): string {
  const raw = (import.meta.env.VITE_AUTH_API_URL ?? "").trim().replace(/\/$/, "");
  if (raw) return raw;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function resolveImageUrl(
  imageMain: string | undefined,
  images: unknown,
  baseUrlHint: string
): string {
  let path: string | undefined;
  if (typeof imageMain === "string" && imageMain.trim()) {
    path = imageMain.trim();
  } else if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string" && first.trim()) path = first.trim();
  }
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  try {
    const base = baseUrlHint.endsWith("/") ? baseUrlHint : `${baseUrlHint}/`;
    const baseUri = new URL(base);
    const resolved = new URL(path.startsWith("/") ? path.slice(1) : path, baseUri);
    return resolved.toString();
  } catch {
    return path;
  }
}

function moneyLabel(v: number): string {
  const fixed = v === Math.round(v) ? 0 : 2;
  return `S/ ${v.toFixed(fixed)}`;
}

function discountLabel(original: number, offer: number): string {
  if (original <= 0 || offer >= original) return "";
  const pct = Math.round(((original - offer) / original) * 100);
  return `-${pct}%`;
}

function formatPickupWindow(startIso: string, endIso: string): string {
  function sliceTime(iso: string): string {
    if (!iso) return "";
    try {
      const dt = new Date(iso);
      if (Number.isNaN(dt.getTime())) {
        if (iso.length >= 16) return iso.slice(11, 16);
        return iso;
      }
      const h = String(dt.getHours()).padStart(2, "0");
      const m = String(dt.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    } catch {
      if (iso.length >= 16) return iso.slice(11, 16);
      return iso;
    }
  }
  const a = sliceTime(startIso);
  const b = sliceTime(endIso);
  if (!a && !b) return "";
  return `${a} - ${b}`;
}

function numField(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

function mapListItem(
  json: Record<string, unknown>,
  baseUrlHint: string
): PartnerProductListRow {
  const idRaw = json.id ?? json.product_id ?? json.productId;
  const id = idRaw != null ? String(idRaw).trim() : "";
  const original = numField(json.price_original);
  const offer = numField(json.price_offer);
  const isActive = typeof json.is_active === "boolean" ? json.is_active : false;
  const start = typeof json.pickup_start === "string" ? json.pickup_start : "";
  const end = typeof json.pickup_end === "string" ? json.pickup_end : "";
  const stock = Math.max(0, Math.trunc(numField(json.stock)));
  const imageUrl = resolveImageUrl(
    json.image_main as string | undefined,
    json.images,
    baseUrlHint
  );

  return {
    id,
    name: typeof json.name === "string" ? json.name : "",
    description: typeof json.description === "string" ? json.description : "",
    imageUrl,
    scheduleLabel: formatPickupWindow(start, end),
    isActive,
    offerPriceLabel: moneyLabel(offer),
    originalPriceLabel: moneyLabel(original),
    discountLabel: discountLabel(original, offer),
    stockCount: stock,
    categoryApiId: categoryApiIdFromProductJson(json),
  };
}

export async function fetchMyProducts(params: {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
  /** Rol admin viendo otro socio. */
  scopedPartnerId?: string;
}): Promise<PartnerProductsPageResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const s = params.search?.trim();
  if (s) q.set("search", s);
  if (params.isActive !== undefined) {
    q.set("is_active", params.isActive ? "true" : "false");
  }

  const rawUrl = `${resolveProductsPath("/products/my-products")}?${q.toString()}`;
  const url = withAdminPartnerScope(rawUrl, params.scopedPartnerId);

  const res = await devLoggedFetch(url, {
    method: "GET",
    headers: authBearerHeaders(),
    signal: params.signal,
  });
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) await handleUnauthorized(res, text);
    throw new Error(await readHttpErrorMessage(res, text));
  }

  let root: Record<string, unknown>;
  try {
    root = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }

  const baseHint = apiBaseUrlForResolvedImages();
  const rawList = root.data;
  const items: PartnerProductListRow[] = [];
  if (Array.isArray(rawList)) {
    for (const e of rawList) {
      if (e && typeof e === "object" && !Array.isArray(e)) {
        items.push(mapListItem(e as Record<string, unknown>, baseHint));
      }
    }
  }

  return {
    page: readIntDynamic(root.page) ?? page,
    limit: readIntDynamic(root.limit) ?? limit,
    total: readIntDynamic(root.total),
    items,
  };
}

function unwrapProductJson(root: Record<string, unknown>): Record<string, unknown> {
  if (!("name" in root) && root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>;
  }
  if (
    !("name" in root) &&
    root.product &&
    typeof root.product === "object" &&
    !Array.isArray(root.product)
  ) {
    return root.product as Record<string, unknown>;
  }
  return root;
}

export type PartnerProductEditPayload = {
  name: string;
  description: string;
  originalPrice: number | null;
  offerPrice: number | null;
  stock: number;
  pickupStart: string;
  pickupEnd: string;
  categoryDraftId: string;
  existingImageUrl: string | null;
  availableDayNums: number[];
  onlyAtClosing: boolean;
};

function apiPickupToHhMm(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) {
      if (iso.length >= 16) return iso.slice(11, 16);
      return "";
    }
    return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  } catch {
    if (iso.length >= 16) return iso.slice(11, 16);
    return "";
  }
}

function decodeAvailableDays(raw: unknown): number[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) list = raw;
  else if (typeof raw === "string" && raw.trim()) {
    try {
      const decoded = JSON.parse(raw) as unknown;
      if (Array.isArray(decoded)) list = decoded;
    } catch {
      return [];
    }
  }
  const out: number[] = [];
  for (const e of list) {
    const n = typeof e === "number" ? e : parseInt(String(e), 10);
    if (Number.isFinite(n) && n >= 1 && n <= 7) out.push(n);
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

export async function fetchProductForEdit(
  productId: string,
  categoryApiIdFallback: number | null,
  signal?: AbortSignal,
  scopedPartnerId?: string
): Promise<PartnerProductEditPayload> {
  const id = encodeURIComponent(productId);
  let url = resolveProductsPath(`/products/${id}`);
  url = withAdminPartnerScope(url, scopedPartnerId);

  const res = await devLoggedFetch(url, { method: "GET", headers: authBearerHeaders(), signal });
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) await handleUnauthorized(res, text);
    throw new Error(await readHttpErrorMessage(res, text));
  }

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
  const json = unwrapProductJson(raw);

  const catDraft = resolveCategoryDraftId(json, categoryApiIdFallback);

  const baseHint = apiBaseUrlForResolvedImages();
  const existingUrl = resolveImageUrl(json.image_main as string | undefined, json.images, baseHint);

  const onlyRaw = json.only_at_closing ?? json.onlyAtClosing;
  const onlyAtClosing = onlyRaw === true || onlyRaw === "true" || onlyRaw === 1;

  return {
    name: typeof json.name === "string" ? json.name : "",
    description: typeof json.description === "string" ? json.description : "",
    originalPrice: json.price_original == null ? null : numField(json.price_original),
    offerPrice: json.price_offer == null ? null : numField(json.price_offer),
    stock: Math.max(0, Math.trunc(numField(json.stock))) || 1,
    pickupStart: apiPickupToHhMm(json.pickup_start as string | undefined),
    pickupEnd: apiPickupToHhMm(json.pickup_end as string | undefined),
    categoryDraftId: catDraft,
    existingImageUrl: existingUrl || null,
    availableDayNums: decodeAvailableDays(json.available_days),
    onlyAtClosing,
  };
}

function matchCategoryByLabel(raw: string): string | null {
  const norm = raw.trim().toLowerCase();
  if (!norm) return null;
  for (const c of PARTNER_PRODUCT_CATEGORIES) {
    if (c.id === norm) return c.id;
    const lbl = c.label.toLowerCase();
    if (lbl === norm) return c.id;
    const primary = lbl.split("/")[0]?.trim();
    if (primary === norm) return c.id;
  }
  return null;
}

function resolveCategoryDraftId(
  json: Record<string, unknown>,
  categoryApiIdFallback: number | null
): string {
  const apiFromJson = categoryApiIdFromProductJson(json);
  if (apiFromJson != null) {
    const fromApi = categoryDraftIdFromApiId(apiFromJson);
    if (fromApi) return fromApi;
  }

  const cat = json.category;
  if (typeof cat === "string") {
    const hit = matchCategoryByLabel(cat);
    if (hit) return hit;
  }
  if (cat && typeof cat === "object" && !Array.isArray(cat)) {
    const name = (cat as Record<string, unknown>).name;
    if (typeof name === "string") {
      const hit = matchCategoryByLabel(name);
      if (hit) return hit;
    }
  }
  for (const key of ["category_name", "categoryName"] as const) {
    const v = json[key];
    if (typeof v === "string") {
      const hit = matchCategoryByLabel(v);
      if (hit) return hit;
    }
  }
  if (categoryApiIdFallback != null) {
    const fromList = categoryDraftIdFromApiId(categoryApiIdFallback);
    if (fromList) return fromList;
  }
  return "";
}

/** Misma lógica que Flutter: fecha local + HH:mm. */
export function formatPickupDateTimeForApi(hhMm24: string): string {
  const v = hhMm24.trim();
  const parts = v.split(":");
  const h = parseInt(parts[0] ?? "0", 10);
  const minute = parseInt(parts[1] ?? "0", 10);
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, minute, 0, 0);
  const y = String(d.getFullYear()).padStart(4, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${mo}-${day}T${hh}:${mm}:${ss}`;
}

export function encodeAvailableDaysForApi(dayNums: number[]): string {
  const sorted = [...new Set(dayNums.filter((n) => n >= 1 && n <= 7))].sort((a, b) => a - b);
  return JSON.stringify(sorted);
}

export async function setProductListingActive(
  productId: string,
  active: boolean,
  signal?: AbortSignal,
  scopedPartnerId?: string
): Promise<void> {
  const id = encodeURIComponent(productId);
  const segment = active ? "activate" : "deactivate";
  let url = resolveProductsPath(`/products/${id}/${segment}`);
  url = withAdminPartnerScope(url, scopedPartnerId);

  const res = await devLoggedFetch(url, {
    method: "PUT",
    headers: authJsonHeaders(),
    signal,
  });
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) await handleUnauthorized(res, text);
    throw new Error(await readHttpErrorMessage(res, text));
  }
}

/** `DELETE /products/{id}` — Bearer en `Authorization`. */
export async function deletePartnerProduct(
  productId: string,
  signal?: AbortSignal,
  scopedPartnerId?: string
): Promise<void> {
  const trimmedId = productId.trim();
  if (!trimmedId) {
    throw new Error("Id de producto inválido.");
  }
  const id = encodeURIComponent(trimmedId);
  let url = resolveProductsPath(`/products/${id}`);
  url = withAdminPartnerScope(url, scopedPartnerId);

  const res = await devLoggedFetch(url, {
    method: "DELETE",
    headers: authBearerHeaders(),
    signal,
  });
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) await handleUnauthorized(res, text);
    throw new Error(await readHttpErrorMessage(res, text));
  }
}

export type ProductMultipartFields = {
  name: string;
  originalPrice: number;
  offerPrice: number;
  pickupStart: string;
  pickupEnd: string;
  stock: number;
  categoryApiId: number;
  availableDaysJson: string;
  description: string;
  imageFile: File | null;
  /** En edición: imagen ya en el servidor; se reenvía en el PUT si no hay archivo nuevo. */
  existingImageUrl?: string | null;
};

function fileNameFromImageUrl(url: string): string {
  const base = url.split("?")[0] ?? url;
  const seg = base.split("/").filter(Boolean).pop();
  if (seg && seg.length > 0 && seg.length < 96) {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  }
  return "product-image.jpg";
}

function mimeFromFileName(name: string): string {
  if (/\.png$/i.test(name)) return "image/png";
  return "image/jpeg";
}

/** Siempre incluir `image` en multipart (igual que Flutter tras el cambio de validación del backend). */
async function resolveImageFileForMultipart(
  imageFile: File | null,
  existingImageUrl: string | null | undefined
): Promise<File> {
  if (imageFile) return imageFile;

  const url = existingImageUrl?.trim();
  if (!url) {
    throw new Error("Falta la imagen del producto.");
  }

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("No se pudo leer la imagen actual del producto.");
  }
  if (!res.ok) {
    throw new Error("No se pudo leer la imagen actual del producto.");
  }

  const blob = await res.blob();
  const name = fileNameFromImageUrl(url);
  const type = blob.type?.startsWith("image/") ? blob.type : mimeFromFileName(name);
  return new File([blob], name, { type });
}

/** Campos de texto idénticos a `_formDataForUpdate` / `_formDataForSubmit` en create_product_repository_impl.dart. */

function appendCommonFields(form: FormData, fields: ProductMultipartFields): void {
  form.append("name", fields.name.trim());
  form.append("price_original", String(fields.originalPrice));
  form.append("price_offer", String(fields.offerPrice));
  form.append("pickup_start", formatPickupDateTimeForApi(fields.pickupStart));
  form.append("pickup_end", formatPickupDateTimeForApi(fields.pickupEnd));
  form.append("stock", String(fields.stock));
  form.append("category_id", String(fields.categoryApiId));
  form.append("available_days", fields.availableDaysJson);
  form.append("description", fields.description.trim());
}

export async function createPartnerProduct(
  fields: ProductMultipartFields,
  signal?: AbortSignal,
  scopedPartnerId?: string
): Promise<void> {
  const image = fields.imageFile;
  if (!image) {
    throw new Error("Falta la imagen del producto.");
  }
  let url = resolveProductsPath("/products");
  url = withAdminPartnerScope(url, scopedPartnerId);
  const form = new FormData();
  appendCommonFields(form, fields);
  form.append("image", image, image.name);

  const res = await devLoggedFetch(url, {
    method: "POST",
    headers: authMultipartHeaders(),
    body: form,
    signal,
  });
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) await handleUnauthorized(res, text);
    throw new Error(await readHttpErrorMessage(res, text));
  }
}

export async function updatePartnerProduct(
  productId: string,
  fields: ProductMultipartFields,
  signal?: AbortSignal,
  scopedPartnerId?: string
): Promise<void> {
  const trimmedId = productId.trim();
  if (!trimmedId) {
    throw new Error("Id de producto inválido.");
  }
  const id = encodeURIComponent(trimmedId);
  let url = resolveProductsPath(`/products/${id}`);
  url = withAdminPartnerScope(url, scopedPartnerId);
  const form = new FormData();
  appendCommonFields(form, fields);

  const image = await resolveImageFileForMultipart(fields.imageFile, fields.existingImageUrl);
  form.append("image", image, image.name);

  const res = await devLoggedFetch(url, {
    method: "PUT",
    headers: authMultipartHeaders(),
    body: form,
    signal,
  });
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) await handleUnauthorized(res, text);
    throw new Error(await readHttpErrorMessage(res, text));
  }
}
