import type {
  AdminOrderDetail,
  AdminOrderDetailProduct,
  AdminOrderListItem,
  AdminOrdersPage,
  AdminOrdersPageKpis,
} from "@/domain/entities/admin_order";
import type { OrderRow } from "@happy-bags/partner-dashboard";
import { mapDashboardOrderStatus } from "@/presentation/mappers/partner_dashboard_mapper";

const AVATAR_COLORS = ["#5b7cfa", "#e94e51", "#22a06b", "#9b59b6", "#f39c12"];

function num(j: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number.parseFloat(v.replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return 0;
}

function str(j: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const v = j[key];
    if (typeof v === "string") return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function formatSol(amount: number): string {
  return `S/${amount.toLocaleString("es-PE", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function maskCustomerName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Cliente";
  return parts
    .map((p) => {
      if (p.length <= 2) return `${p[0] ?? ""}***`;
      return `${p.slice(0, 2)}***`;
    })
    .join(" ");
}

function customerInitial(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t.charAt(0).toUpperCase();
}

function avatarColorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[h] ?? AVATAR_COLORS[0]!;
}

export function mapApiOrderStatusLabel(apiStatus: string): string {
  return mapDashboardOrderStatus(apiStatus);
}

export function mapUiStatusToApiFilter(uiStatus: string): string | undefined {
  const map: Record<string, string> = {
    Pendiente: "PENDING_PAYMENT",
    Confirmada: "PAID",
    "Por recoger": "READY",
    Recogida: "DELIVERED",
    Cancelada: "CANCELLED",
  };
  return map[uiStatus];
}

function productLabelFromJson(j: Record<string, unknown>): string {
  const name = str(j, "product_name", "productName", "name", "title");
  const qty = num(j, "quantity", "qty", "amount");
  if (name && qty > 0) return `${name} x${qty}`;
  return name || "—";
}

function pickupWindowFromJson(j: Record<string, unknown>): string {
  const direct = str(
    j,
    "pickup_window",
    "pickupWindow",
    "pickup_time",
    "pickupTime",
    "pickup_hours",
    "pickupHours"
  );
  if (direct) return direct;
  const from = str(j, "pickup_from", "pickupFrom");
  const to = str(j, "pickup_to", "pickupTo");
  if (from && to) return `${from} - ${to}`;
  return "—";
}

function orderListItemFromJson(j: Record<string, unknown>): AdminOrderListItem {
  const orderId = num(j, "order_id", "orderId", "id");
  const orderCodeRaw = str(j, "order_code", "orderCode", "code");
  const orderCode = orderCodeRaw || `#ORD-${orderId}`;
  const customerName = str(
    j,
    "customer_name",
    "customerName",
    "user_name",
    "userName",
    "client_name",
    "clientName"
  );
  const total = num(j, "total", "amount", "total_amount", "totalAmount");
  const status = str(j, "status", "order_status", "orderStatus");
  return {
    orderId,
    orderCode: orderCode.startsWith("#") ? orderCode : `#${orderCode}`,
    customerName: customerName || "Cliente",
    customerMasked: str(j, "customer_masked", "customerMasked") || maskCustomerName(customerName),
    customerInitial: customerInitial(customerName),
    productLabel:
      str(j, "product_label", "productLabel") || productLabelFromJson(j),
    total,
    totalDisplay: formatSol(total),
    status,
    statusLabel: mapApiOrderStatusLabel(status),
    pickupWindow: pickupWindowFromJson(j),
    createdAt: str(j, "created_at", "createdAt"),
  };
}

function kpisFromJson(j: Record<string, unknown>) {
  return {
    pendingPayment: num(j, "pending_payment", "pendingPayment"),
    paid: num(j, "paid"),
    preparing: num(j, "preparing"),
    ready: num(j, "ready"),
    delivered: num(j, "delivered"),
    cancelled: num(j, "cancelled", "canceled"),
    expired: num(j, "expired"),
    total: num(j, "total"),
  };
}

function paginationFromJson(
  j: Record<string, unknown>,
  fallbackPage: number,
  fallbackLimit: number
): { total: number; page: number; limit: number } {
  const pag = j.pagination;
  if (pag && typeof pag === "object" && !Array.isArray(pag)) {
    const p = pag as Record<string, unknown>;
    return {
      total: num(p, "total", "count", "total_count", "totalCount"),
      page: num(p, "page", "current_page", "currentPage") || fallbackPage,
      limit: num(p, "limit", "per_page", "perPage", "page_size", "pageSize") || fallbackLimit,
    };
  }
  return {
    total: num(j, "total", "count", "total_count", "totalCount"),
    page: num(j, "page", "current_page", "currentPage") || fallbackPage,
    limit: num(j, "limit", "per_page", "perPage", "page_size", "pageSize") || fallbackLimit,
  };
}

/** Tarjetas de estado de la vista órdenes ← `kpis` del listado. */
export function ordersPageKpisToStatusCounts(
  kpis: AdminOrdersPageKpis
): Record<string, number> {
  return {
    Pendiente: kpis.pendingPayment,
    Confirmada: kpis.paid,
    "Por recoger": kpis.ready,
    Recogida: kpis.delivered,
    Cancelada: kpis.cancelled,
  };
}

export function adminOrdersPageFromJson(
  j: Record<string, unknown>,
  fallbackPage: number,
  fallbackLimit: number
): AdminOrdersPage {
  const itemsRaw =
    j.items ?? j.orders ?? j.results ?? (Array.isArray(j.data) ? j.data : null);
  const items: AdminOrderListItem[] = Array.isArray(itemsRaw)
    ? itemsRaw
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .map(orderListItemFromJson)
    : [];

  const pag = paginationFromJson(j, fallbackPage, fallbackLimit);
  const kpisRaw = j.kpis;
  const kpis =
    kpisRaw && typeof kpisRaw === "object" && !Array.isArray(kpisRaw)
      ? kpisFromJson(kpisRaw as Record<string, unknown>)
      : null;

  return {
    items,
    total: pag.total || items.length,
    page: pag.page,
    limit: pag.limit,
    kpis,
  };
}

export function adminOrderListToOrderRows(items: AdminOrderListItem[]): OrderRow[] {
  return items.map((o) => ({
    id: o.orderCode,
    customer: o.customerMasked,
    initial: o.customerInitial,
    avatarColor: avatarColorFor(`${o.orderId}-${o.customerName}`),
    product: o.productLabel,
    total: o.totalDisplay,
    status: o.statusLabel as OrderRow["status"],
    pickup: o.pickupWindow,
  }));
}

const PROGRESS_STEPS = [
  { key: "pending", label: "Pendiente", statuses: ["PENDING", "PENDIENTE"] },
  { key: "paid", label: "Confirmada", statuses: ["PAID", "CONFIRMED"] },
  { key: "ready", label: "Por recoger", statuses: ["READY", "PICKUP_READY"] },
  { key: "picked", label: "Recogida", statuses: ["PICKED_UP", "COMPLETED"] },
] as const;

/** Estados en los que el socio puede aceptar (→ PREPARING) o rechazar (→ CANCELLED). */
export function orderAllowsPartnerStatusActions(apiStatus: string): boolean {
  const s = apiStatus.trim().toUpperCase();
  return ["PENDING", "PAID", "CONFIRMED", "CONFIRMADA"].includes(s);
}

export function acceptOrderStatusPayload(): { status: string; notes: string } {
  return { status: "PREPARING", notes: "Preparando pedido" };
}

export function rejectOrderStatusPayload(): { status: string; notes: string } {
  return { status: "CANCELLED", notes: "Orden rechazada por el socio" };
}

function buildProgressSteps(status: string): AdminOrderDetail["progressSteps"] {
  const s = status.trim().toUpperCase();
  let activeIndex = 0;
  if (["PAID", "CONFIRMED", "CONFIRMADA"].includes(s)) activeIndex = 1;
  if (
    ["PREPARING", "PREPARATION", "EN_PREPARACION", "EN_PREPARACIÓN"].includes(s)
  ) {
    activeIndex = 1;
  }
  if (["READY", "PICKUP_READY", "POR_RECOGER"].includes(s)) activeIndex = 2;
  if (["PICKED_UP", "COMPLETED", "RECOGIDA"].includes(s)) activeIndex = 3;
  if (["CANCELLED", "CANCELED", "CANCELADA"].includes(s)) activeIndex = -1;

  return PROGRESS_STEPS.map((step, idx) => ({
    key: step.key,
    label: step.label,
    done: activeIndex >= 0 && idx < activeIndex,
    active: activeIndex >= 0 && idx === activeIndex,
  }));
}

function productFromJson(j: Record<string, unknown>): AdminOrderDetailProduct {
  const price = num(j, "price", "unit_price", "unitPrice", "amount");
  return {
    id: num(j, "id", "product_id", "productId"),
    name: str(j, "name", "product_name", "productName", "title"),
    price,
    priceDisplay: formatSol(price),
    status: str(j, "status", "item_status", "itemStatus"),
    statusLabel:
      str(j, "status_label", "statusLabel") ||
      mapApiOrderStatusLabel(str(j, "status", "item_status")),
    storeName: str(j, "store_name", "storeName", "business_name", "businessName"),
    pickupWindow: pickupWindowFromJson(j),
    imageUrl: str(j, "image_url", "imageUrl", "image") || null,
  };
}

export function adminOrderDetailFromJson(
  j: Record<string, unknown>,
  fallbackOrderId: number
): AdminOrderDetail {
  const orderId = num(j, "order_id", "orderId", "id") || fallbackOrderId;
  const orderCodeRaw = str(j, "order_code", "orderCode", "code");
  const orderCode = orderCodeRaw || `#ORD-${orderId}`;
  const status = str(j, "status", "order_status", "orderStatus");
  const subtotal = num(j, "subtotal", "sub_total", "subTotal");
  const savings = num(j, "savings", "discount", "ahorro", "saved_amount", "savedAmount");
  const total = num(j, "total", "amount", "total_amount", "totalAmount");
  const productsRaw = j.products ?? j.items ?? j.order_items ?? j.orderItems;
  const products = Array.isArray(productsRaw)
    ? productsRaw
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .map(productFromJson)
    : [];

  const createdAt = str(j, "created_at", "createdAt", "ordered_at", "orderedAt");
  const createdAtLabel =
    str(j, "created_at_label", "createdAtLabel") ||
    (createdAt
      ? new Date(createdAt).toLocaleString("es-PE", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—");

  return {
    orderId,
    orderCode: orderCode.startsWith("#") ? orderCode : `#${orderCode}`,
    createdAtLabel,
    paymentMethod: str(j, "payment_method", "paymentMethod", "payment") || "—",
    status,
    statusLabel: mapApiOrderStatusLabel(status),
    subtotal,
    savings,
    total,
    subtotalDisplay: formatSol(subtotal),
    savingsDisplay: savings > 0 ? `- ${formatSol(savings)}` : formatSol(0),
    totalDisplay: formatSol(total),
    pickupWindow: pickupWindowFromJson(j),
    pickupNote:
      str(j, "pickup_note", "pickupNote") ||
      (pickupWindowFromJson(j) !== "—"
        ? `Código válido hasta el fin del horario de recojo`
        : ""),
    products,
    progressSteps: buildProgressSteps(status),
  };
}
