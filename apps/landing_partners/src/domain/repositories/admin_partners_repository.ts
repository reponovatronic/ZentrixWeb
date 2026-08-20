import type {
  AdminPartnersListPageEntity,
  AdminPartnersListRequest,
} from "@/domain/entities/admin_partners_list";

export type AdminPartnersRepository = {
  fetchPartnersPage(
    query: AdminPartnersListRequest,
    signal?: AbortSignal
  ): Promise<AdminPartnersListPageEntity>;
};
