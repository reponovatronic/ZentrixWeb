import type {
  AdminPartnerListItemEntity,
  AdminPartnersListPageEntity,
  AdminPartnersPaginationEntity,
} from "@/domain/entities/admin_partners_list";
import type { PartnerDirectoryRow } from "@/domain/entities/partner_directory_row";

/** `GET /admin/partners`: `items[].partner_id|business_name|business_type|…` y `pagination`. */

const AVATAR_COLORS = [
  "#e94e51",
  "#5b7cfa",
  "#22a06b",
  "#9b59b6",
  "#f39c12",
  "#1abc9c",
  "#e67e22",
  "#8e44ad",
  "#3498db",
  "#c0392b",
  "#16a085",
  "#d35400",
] as const;

function str(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function numPart(j: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
    if (typeof v === "string" && v.trim()) {
      const n = Number.parseInt(v.trim(), 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function readBool(v: unknown): boolean {
  if (v === true || v === 1 || v === "1" || v === "true") return true;
  return false;
}

function createdAtLabel(iso: string): string {
  const t = iso.trim();
  if (!t) return "—";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return t.slice(0, 10);
  return d.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusFromActive(isActive: boolean): PartnerDirectoryRow["status"] {
  return isActive ? "active" : "inactive";
}

function initialsFromName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const ch = t.charAt(0).toLocaleUpperCase("es-PE");
  return ch || "?";
}

function avatarColor(partnerId: number): string {
  if (!Number.isFinite(partnerId) || partnerId <= 0) return AVATAR_COLORS[0];
  const i = (partnerId - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

export function adminPartnerListItemEntityFromJson(row: Record<string, unknown>): AdminPartnerListItemEntity | null {
  const partnerId = numPart(row, "partner_id", "partnerId", "id");
  if (partnerId == null || partnerId <= 0) return null;
  return {
    partnerId,
    businessName: str(row, "business_name", "businessName"),
    businessType: str(row, "business_type", "businessType", "category"),
    ownerName: str(row, "owner_name", "ownerName", "contact_name", "full_name"),
    email: str(row, "email"),
    phone: str(row, "phone", "telefono", "phone_number"),
    address: str(row, "address", "direccion"),
    isActive: readBool(row.is_active ?? row.isActive),
    createdAt: str(row, "created_at", "createdAt"),
  };
}

export function adminPartnersPaginationEntityFromJson(
  j: Record<string, unknown> | null
): AdminPartnersPaginationEntity {
  if (!j) {
    return { page: 1, limit: 20, total: 0, pages: 1 };
  }
  const page = numPart(j, "page") ?? 1;
  const limit = numPart(j, "limit") ?? 20;
  const total = numPart(j, "total") ?? 0;
  const pages = Math.max(1, numPart(j, "pages") ?? 1);
  return { page, limit, total, pages };
}

export function adminPartnersListPageEntityFromJson(root: Record<string, unknown>): AdminPartnersListPageEntity {
  const rawItems = root.items;
  const itemsOut: AdminPartnerListItemEntity[] = [];
  if (Array.isArray(rawItems)) {
    for (const row of rawItems) {
      if (!row || typeof row !== "object" || Array.isArray(row)) continue;
      const ent = adminPartnerListItemEntityFromJson(row as Record<string, unknown>);
      if (ent) itemsOut.push(ent);
    }
  }

  const paginationRaw = root.pagination ?? root.meta;
  const paginationRecord =
    paginationRaw &&
    typeof paginationRaw === "object" &&
    !Array.isArray(paginationRaw)
      ? (paginationRaw as Record<string, unknown>)
      : null;

  return {
    items: itemsOut,
    pagination: adminPartnersPaginationEntityFromJson(paginationRecord),
  };
}

function adminPartnerEntityToSnakeRawItem(ent: AdminPartnerListItemEntity): Record<string, unknown> {
  return {
    partner_id: ent.partnerId,
    business_name: ent.businessName,
    business_type: ent.businessType,
    owner_name: ent.ownerName,
    email: ent.email,
    phone: ent.phone,
    address: ent.address,
    is_active: ent.isActive,
    created_at: ent.createdAt,
  };
}

export function adminPartnerEntityToDirectoryRow(ent: AdminPartnerListItemEntity): PartnerDirectoryRow {
  return {
    id: String(ent.partnerId),
    businessName: ent.businessName || `Socio ${ent.partnerId}`,
    email: ent.email || "—",
    category: ent.businessType || "—",
    status: statusFromActive(ent.isActive),
    joinedAtLabel: createdAtLabel(ent.createdAt),
    initial: initialsFromName(ent.businessName || ent.ownerName),
    avatarColor: avatarColor(ent.partnerId),
    ownerName: ent.ownerName.trim() || undefined,
    phone: ent.phone.trim() || undefined,
    listItemRaw: adminPartnerEntityToSnakeRawItem(ent),
  };
}