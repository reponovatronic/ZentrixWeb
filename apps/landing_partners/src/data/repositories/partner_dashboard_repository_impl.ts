import type {
  PartnerDashboard,
  PartnerDashboardOrder,
} from "@/domain/entities/partner_dashboard";
import type { PartnerDashboardRepository } from "@/domain/repositories/partner_dashboard_repository";
import { getPartnerDashboardJson } from "@/data/http/partner_dashboard_client";

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

function orderFromJson(j: Record<string, unknown>): PartnerDashboardOrder {
  return {
    orderId: num(j, "order_id", "orderId", "id"),
    orderCode: str(j, "order_code", "orderCode", "code"),
    userName: str(j, "user_name", "userName", "customer", "customer_name"),
    status: str(j, "status", "estado", "order_status"),
    total: num(j, "total", "amount", "total_amount"),
    createdAt: str(j, "created_at", "createdAt"),
    remainingSeconds: num(j, "remaining_seconds", "remainingSeconds"),
  };
}

export function partnerDashboardFromJson(j: Record<string, unknown>): PartnerDashboard {
  const ordersRaw = j.orders;
  const orders: PartnerDashboardOrder[] = Array.isArray(ordersRaw)
    ? ordersRaw
        .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
        .map((row) => orderFromJson(row))
    : [];

  return {
    todayOrders: num(j, "today_orders", "todayOrders"),
    todayIncome: num(j, "today_income", "todayIncome"),
    paidOrders: num(j, "paid_orders", "paidOrders"),
    preparingOrders: num(j, "preparing_orders", "preparingOrders"),
    readyOrders: num(j, "ready_orders", "readyOrders"),
    orders,
  };
}

export class PartnerDashboardRepositoryImpl implements PartnerDashboardRepository {
  async fetchDashboard(abortSignal?: AbortSignal): Promise<PartnerDashboard> {
    const j = await getPartnerDashboardJson(abortSignal);
    return partnerDashboardFromJson(j);
  }
}
