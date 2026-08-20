import type { AdminOrderDetail, AdminOrdersPage } from "@/domain/entities/admin_order";

export type FetchAdminOrdersParams = {
  partnerId: number;
  page?: number;
  limit?: number;
  status?: string;
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  signal?: AbortSignal;
};

export type UpdatePartnerOrderStatusParams = {
  orderId: number;
  status: string;
  notes?: string;
  signal?: AbortSignal;
};

export interface AdminOrdersRepository {
  fetchOrders(params: FetchAdminOrdersParams): Promise<AdminOrdersPage>;
  fetchOrderDetail(
    orderId: number,
    partnerId: number,
    signal?: AbortSignal
  ): Promise<AdminOrderDetail>;
  /** `PATCH /partners/orders/{id}/status` */
  updateOrderStatus(params: UpdatePartnerOrderStatusParams): Promise<void>;
}
