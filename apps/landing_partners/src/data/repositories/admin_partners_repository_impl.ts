import type { AdminPartnersRepository } from "@/domain/repositories/admin_partners_repository";
import type { AdminPartnersListPageEntity } from "@/domain/entities/admin_partners_list";
import { getAdminPartnersListJson } from "@/data/http/admin_partners_client";
import { adminPartnersListPageEntityFromJson } from "@/presentation/mappers/admin_partners_mapper";

export class AdminPartnersRepositoryImpl implements AdminPartnersRepository {
  async fetchPartnersPage(
    query: Parameters<AdminPartnersRepository["fetchPartnersPage"]>[0],
    signal?: AbortSignal
  ): Promise<AdminPartnersListPageEntity> {
    const j = await getAdminPartnersListJson(query, signal);
    return adminPartnersListPageEntityFromJson(j);
  }
}
