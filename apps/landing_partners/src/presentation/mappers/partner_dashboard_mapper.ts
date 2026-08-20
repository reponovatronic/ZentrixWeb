import type { PartnerDashboard } from "@/domain/entities/partner_dashboard";
import type { KpiCard, OrderRow } from "@happy-bags/partner-dashboard";

const AVATAR_COLORS = ["#5b7cfa", "#e94e51", "#22a06b", "#9b59b6", "#f39c12"];

function formatSol(amount: number): string {
  return `S/${amount.toLocaleString("es-PE", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCount(n: number): string {
  return n.toLocaleString("es-PE");
}

function avatarColorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[h] ?? AVATAR_COLORS[0]!;
}

function customerInitial(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  return t.charAt(0).toUpperCase();
}

function formatRemainingSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCreatedAt(iso: string): string {
  if (!iso.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pickupLabel(remainingSeconds: number, createdAt: string): string {
  if (Number.isFinite(remainingSeconds) && remainingSeconds > 0) {
    return formatRemainingSeconds(remainingSeconds);
  }
  return formatCreatedAt(createdAt);
}

/** Mapea el `status` del API a las etiquetas del diseño del dashboard. */
export function mapDashboardOrderStatus(apiStatus: string): OrderRow["status"] {
  const s = apiStatus.trim().toLowerCase().replace(/\s+/g, "_");
  if (
    s === "pending" ||
    s === "pendiente" ||
    s === "pending_payment" ||
    s === "awaiting_payment" ||
    s === "created"
  ) {
    return "Pendiente";
  }
  if (
    s === "paid" ||
    s === "pagada" ||
    s === "pagado" ||
    s === "confirmed" ||
    s === "confirmada" ||
    s === "payment_confirmed"
  ) {
    return "Confirmada";
  }
  if (
    s === "preparing" ||
    s === "en_preparacion" ||
    s === "en_preparación" ||
    s === "preparation"
  ) {
    return "Confirmada";
  }
  if (
    s === "ready" ||
    s === "lista" ||
    s === "listo" ||
    s === "por_recoger" ||
    s === "pickup_ready" ||
    s === "ready_for_pickup"
  ) {
    return "Por recoger";
  }
  if (
    s === "picked_up" ||
    s === "recogida" ||
    s === "completed" ||
    s === "delivered" ||
    s === "finished"
  ) {
    return "Recogida";
  }
  if (
    s === "cancelled" ||
    s === "canceled" ||
    s === "cancelada" ||
    s === "cancelled_order"
  ) {
    return "Cancelada";
  }
  return "Pendiente";
}

function neutralSpark(): number[] {
  return [8, 8, 9, 9, 10, 10, 10];
}

export function partnerDashboardToKpis(data: PartnerDashboard): KpiCard[] {
  return [
    {
      title: "Ventas del día",
      value: formatSol(data.todayIncome),
      trendLabel: "Hoy",
      trendUp: true,
      spark: neutralSpark(),
    },
    {
      title: "Órdenes recibidas",
      value: formatCount(data.todayOrders),
      trendLabel: "Hoy",
      trendUp: true,
      spark: neutralSpark(),
    },
    {
      title: "En preparación",
      value: formatCount(data.preparingOrders),
      trendLabel: `${formatCount(data.paidOrders)} pagadas`,
      trendUp: data.preparingOrders > 0,
      spark: neutralSpark(),
    },
    {
      title: "Listas para recoger",
      value: formatCount(data.readyOrders),
      trendLabel: data.readyOrders > 0 ? "Activas" : "Sin pendientes",
      trendUp: data.readyOrders > 0,
      spark: neutralSpark(),
    },
  ];
}

export function partnerDashboardToOrderRows(data: PartnerDashboard): OrderRow[] {
  return data.orders.map((o) => {
    const customer = o.userName.trim() || "Cliente";
    const code = o.orderCode.trim() || `#${o.orderId}`;
    const seed = `${o.orderId}-${customer}`;
    return {
      id: code.startsWith("#") ? code : `#${code}`,
      customer,
      initial: customerInitial(customer),
      avatarColor: avatarColorFor(seed),
      product: "—",
      total: formatSol(o.total),
      status: mapDashboardOrderStatus(o.status),
      pickup: pickupLabel(o.remainingSeconds, o.createdAt),
    };
  });
}
