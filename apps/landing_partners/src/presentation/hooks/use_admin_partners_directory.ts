import { AdminPartnersRepositoryImpl } from "@/data/repositories/admin_partners_repository_impl";
import type { PartnerDirectoryRow } from "@/domain/entities/partner_directory_row";
import { adminPartnerEntityToDirectoryRow } from "@/presentation/mappers/admin_partners_mapper";
import { useEffect, useState } from "react";

const repo = new AdminPartnersRepositoryImpl();

export type AdminPartnersActiveFilter = "active" | "inactive" | "all";

/** Coincide con el `limit` habitual del backend (p.ej. 5 en cada página). */
export const ADMIN_PARTNERS_PAGE_LIMIT = 5;

export function useAdminPartnersDirectory(params: {
  page: number;
  activeFilter: AdminPartnersActiveFilter;
}) {
  const { page, activeFilter } = params;
  const [rows, setRows] = useState<PartnerDirectoryRow[]>([]);
  const [serverPage, setServerPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isActiveParam: boolean | undefined =
    activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await repo.fetchPartnersPage(
          {
            page,
            limit: ADMIN_PARTNERS_PAGE_LIMIT,
            isActive: isActiveParam,
          },
          ac.signal
        );
        if (ac.signal.aborted) return;
        setRows(data.items.map(adminPartnerEntityToDirectoryRow));
        setServerPage(data.pagination.page || page);
        setTotalPages(Math.max(1, data.pagination.pages || 1));
        setTotalItems(data.pagination.total ?? data.items.length);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (ac.signal.aborted) return;
        setRows([]);
        setTotalPages(1);
        setTotalItems(0);
        setError(
          e instanceof Error ? e.message : "No se pudo cargar el listado de partners."
        );
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [page, isActiveParam]);

  return {
    rows,
    serverPage,
    totalPages,
    totalItems,
    loading,
    error,
  };
}
