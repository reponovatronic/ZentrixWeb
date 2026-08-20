import type { AdminOrderDetail, AdminOrdersPage } from "@/domain/entities/admin_order";
import type {
  AdminOrdersRepository,
  FetchAdminOrdersParams,
  UpdatePartnerOrderStatusParams,
} from "@/domain/repositories/admin_orders_repository";
import {
  getAdminOrderDetailJson,
  getAdminOrdersListJson,
} from "@/data/http/admin_orders_client";
import { isPortalAdminApiMode } from "@/data/http/portal_api_mode";
import {
  getPartnerOrderDetailJson,
  getPartnerOrdersListJson,
} from "@/data/http/partner_orders_list_client";
import { patchPartnerOrderStatus } from "@/data/http/partner_orders_status_client";
import {
  adminOrderDetailFromJson,
  adminOrdersPageFromJson,
} from "@/presentation/mappers/admin_orders_mapper";

export class AdminOrdersRepositoryImpl implements AdminOrdersRepository {
  async fetchOrders(params: FetchAdminOrdersParams): Promise<AdminOrdersPage> {
    const j = isPortalAdminApiMode()
      ? await getAdminOrdersListJson(
          {
            partnerId: params.partnerId,
            page: params.page,
            limit: params.limit,
            status: params.status,
            orderId: params.orderId,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
          },
          params.signal
        )
      : await getPartnerOrdersListJson(
          {
            page: params.page,
            limit: params.limit,
            status: params.status,
            orderId: params.orderId,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
          },
          params.signal
        );
    return adminOrdersPageFromJson(j, params.page ?? 1, params.limit ?? 20);
  }

  async fetchOrderDetail(
    orderId: number,
    partnerId: number,
    signal?: AbortSignal
  ): Promise<AdminOrderDetail> {
    const j = isPortalAdminApiMode()
      ? await getAdminOrderDetailJson(orderId, partnerId, signal)
      : await getPartnerOrderDetailJson(orderId, signal);
    return adminOrderDetailFromJson(j, orderId);
  }

  async updateOrderStatus(params: UpdatePartnerOrderStatusParams): Promise<void> {
    if (isPortalAdminApiMode()) {
      throw new Error("Solo el socio puede cambiar el estado de la orden.");
    }
    await patchPartnerOrderStatus(
      params.orderId,
      { status: params.status, notes: params.notes },
      params.signal
    );
  }
}
