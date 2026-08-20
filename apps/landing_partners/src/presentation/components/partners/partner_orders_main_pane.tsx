import { AdminOrdersRepositoryImpl } from "@/data/repositories/admin_orders_repository_impl";
import type { AdminOrderListItem } from "@/domain/entities/admin_order";
import { OrdersEmptyState } from "@/presentation/components/common/orders_empty_state";
import { PartnerOrderDetailModal } from "@/presentation/components/partners/partner_order_detail_modal";
import { useAdminOrdersList } from "@/presentation/hooks/use_admin_orders_list";
import { usePartnerDashboardFilters } from "@/presentation/hooks/use_partner_dashboard_filters";
import { isSessionUnauthorizedError } from "@/data/auth/session_unauthorized_error";
import { isPortalAdminApiMode } from "@/data/http/portal_api_mode";
import {
  acceptOrderStatusPayload,
  ordersPageKpisToStatusCounts,
  rejectOrderStatusPayload,
} from "@/presentation/mappers/admin_orders_mapper";
import { useDownloadReportModal } from "@/presentation/contexts/download_report_modal_context";
import { resolvePartnerIdQuery } from "@/presentation/utils/dashboard_query_utils";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 20;
const ordersRepo = new AdminOrdersRepositoryImpl();

const STATUS_CARDS: Array<{
  label: AdminOrderListItem["statusLabel"];
  apiStatus: string;
}> = [
  { label: "Pendiente", apiStatus: "PENDING_PAYMENT" },
  { label: "Confirmada", apiStatus: "PAID" },
  { label: "Por recoger", apiStatus: "READY" },
  { label: "Recogida", apiStatus: "DELIVERED" },
  { label: "Cancelada", apiStatus: "CANCELLED" },
];

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function statusPillClass(label: string): string {
  switch (label) {
    case "Pendiente":
      return "pp-orders-pill pp-orders-pill--warn";
    case "Confirmada":
      return "pp-orders-pill pp-orders-pill--blue";
    case "Por recoger":
      return "pp-orders-pill pp-orders-pill--ok";
    case "Recogida":
      return "pp-orders-pill pp-orders-pill--muted";
    case "Cancelada":
      return "pp-orders-pill pp-orders-pill--fail";
    default:
      return "pp-orders-pill pp-orders-pill--muted";
  }
}

function buildPageNumbers(totalPages: number, current: number): (number | "ellipsis")[] {
  if (totalPages <= 11) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const out: (number | "ellipsis")[] = [1];
  if (current > 4) out.push("ellipsis");
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let p = start; p <= end; p++) out.push(p);
  if (current < totalPages - 3) out.push("ellipsis");
  out.push(totalPages);
  return out;
}

export type PartnerOrdersMainPaneProps = {
  partnerId: string;
  partnerRole?: string | null;
};

export function PartnerOrdersMainPane({
  partnerId,
  partnerRole = null,
}: PartnerOrdersMainPaneProps) {
  const { openDownloadReport } = useDownloadReportModal();
  const { presetId, customRange } = usePartnerDashboardFilters();
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<
    ReturnType<AdminOrdersRepositoryImpl["fetchOrderDetail"]>
  > | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(search), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const { data, loading, error } = useAdminOrdersList({
    partnerId,
    presetId,
    customRange,
    page,
    limit: PAGE_SIZE,
    statusFilter,
    orderIdSearch: searchDebounced,
    refreshKey: listRefreshKey,
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [presetId, customRange.from, customRange.to, statusFilter, searchDebounced]);

  useEffect(() => {
    if (data?.kpis) {
      setStatusCounts(ordersPageKpisToStatusCounts(data.kpis));
    } else if (!loading) {
      setStatusCounts({});
    }
  }, [data?.kpis, loading]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(totalPages, currentPage),
    [totalPages, currentPage]
  );

  const refreshDetail = useCallback(
    async (orderId: number) => {
      const pid = resolvePartnerIdQuery(partnerId);
      if (isPortalAdminApiMode() && !pid) return;
      const d = await ordersRepo.fetchOrderDetail(orderId, pid ?? 0);
      setDetail(d);
    },
    [partnerId]
  );

  const applyStatusChange = useCallback(
    async (payload: { status: string; notes: string }) => {
      if (!detail) return;
      setActionBusy(true);
      setActionError(null);
      try {
        await ordersRepo.updateOrderStatus({
          orderId: detail.orderId,
          status: payload.status,
          notes: payload.notes,
        });
        await refreshDetail(detail.orderId);
        setListRefreshKey((k) => k + 1);
      } catch (e: unknown) {
        if (isSessionUnauthorizedError(e)) return;
        setActionError(
          e instanceof Error ? e.message : "No se pudo actualizar la orden."
        );
      } finally {
        setActionBusy(false);
      }
    },
    [detail, refreshDetail]
  );

  const openDetail = useCallback(
    async (orderId: number) => {
      const pid = resolvePartnerIdQuery(partnerId);
      if (isPortalAdminApiMode() && !pid) return;
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError(null);
      setActionError(null);
      setDetail(null);
      try {
        const d = await ordersRepo.fetchOrderDetail(orderId, pid ?? 0);
        setDetail(d);
      } catch (e: unknown) {
        setDetailError(
          e instanceof Error ? e.message : "No se pudo cargar el detalle."
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [partnerId]
  );

  const items = data?.items ?? [];
  const showEmpty = !loading && !error && items.length === 0;

  return (
    <div className="pp-orders-pane">
      <section className="pp-orders-status-cards" aria-label="Resumen por estado">
        {STATUS_CARDS.map((card) => (
          <button
            key={card.label}
            type="button"
            className={
              statusFilter === card.label
                ? "pp-orders-status-card pp-orders-status-card--active"
                : "pp-orders-status-card"
            }
            onClick={() =>
              setStatusFilter((prev) => (prev === card.label ? undefined : card.label))
            }
          >
            <span className="pp-orders-status-card-count">
              {statusCounts[card.label] ?? "—"}
            </span>
            <span className="pp-orders-status-card-label">{card.label}</span>
          </button>
        ))}
      </section>

      <section className="pp-orders-card" aria-labelledby="pp-orders-heading">
        <div className="pp-orders-toolbar">
          <h2 id="pp-orders-heading" className="pp-orders-title">
            Todas las órdenes
          </h2>
          <div className="pp-orders-tools">
            <label className="pp-orders-search">
              <IconSearch />
              <input
                type="search"
                placeholder="Buscar orden…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar por ID de orden"
              />
            </label>
            <button
              type="button"
              className="pp-orders-btn-download"
              onClick={openDownloadReport}
            >
              <IconDownload />
              Descargar reporte
            </button>
          </div>
        </div>

        {error ? (
          <p className="pp-orders-alert" role="alert">
            {error}
          </p>
        ) : null}

        {showEmpty ? (
          <OrdersEmptyState />
        ) : (
          <>
            <div className="pp-orders-table-wrap">
              <table className="pp-orders-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 40 }}>
                      <span className="pp-orders-sr">Seleccionar</span>
                    </th>
                    <th scope="col">ORDEN</th>
                    <th scope="col">CLIENTE</th>
                    <th scope="col">PRODUCTO</th>
                    <th scope="col">TOTAL</th>
                    <th scope="col">Estado</th>
                    <th scope="col">H. RECOJO</th>
                    <th scope="col" className="pp-orders-th-actions">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="pp-orders-empty">
                        Cargando órdenes…
                      </td>
                    </tr>
                  ) : null}
                  {!loading
                    ? items.map((row, i) => (
                        <tr
                          key={`${row.orderId}-${row.orderCode}`}
                          className={i % 2 === 1 ? "pp-orders-tr--alt" : undefined}
                        >
                          <td>
                            <input type="checkbox" aria-label={`Seleccionar ${row.orderCode}`} />
                          </td>
                          <td className="pp-orders-mono">{row.orderCode}</td>
                          <td>
                            <div className="pp-orders-client">
                              <span
                                className="pp-orders-avatar"
                                style={{
                                  background: `hsl(${(row.orderId * 47) % 360} 55% 52%)`,
                                }}
                                aria-hidden
                              >
                                {row.customerInitial}
                              </span>
                              <span>{row.customerMasked}</span>
                            </div>
                          </td>
                          <td>{row.productLabel}</td>
                          <td className="pp-orders-mono">{row.totalDisplay}</td>
                          <td>
                            <span className={statusPillClass(row.statusLabel)}>
                              <span className="pp-orders-pill-dot" aria-hidden />
                              {row.statusLabel}
                            </span>
                          </td>
                          <td className="pp-orders-time">{row.pickupWindow}</td>
                          <td>
                            <button
                              type="button"
                              className="pp-orders-icon-btn"
                              aria-label={`Ver detalle de ${row.orderCode}`}
                              onClick={() => void openDetail(row.orderId)}
                            >
                              <IconEye />
                            </button>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <nav className="pp-orders-pagination" aria-label="Paginación">
                <button
                  type="button"
                  className="pp-orders-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                {pageNumbers.map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`e-${idx}`} className="pp-orders-page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      className={
                        item === currentPage
                          ? "pp-orders-page-num pp-orders-page-num--current"
                          : "pp-orders-page-num"
                      }
                      onClick={() => setPage(item)}
                      aria-label={`Página ${item}`}
                      aria-current={item === currentPage ? "page" : undefined}
                    >
                      {String(item).padStart(2, "0")}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="pp-orders-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Página siguiente"
                >
                  ›
                </button>
              </nav>
            ) : null}
          </>
        )}
      </section>

      <PartnerOrderDetailModal
        open={detailOpen}
        loading={detailLoading}
        error={detailError}
        detail={detail}
        partnerRole={partnerRole}
        actionBusy={actionBusy}
        actionError={actionError}
        onClose={() => setDetailOpen(false)}
        onAccept={() => void applyStatusChange(acceptOrderStatusPayload())}
        onReject={() => void applyStatusChange(rejectOrderStatusPayload())}
      />
    </div>
  );
}
