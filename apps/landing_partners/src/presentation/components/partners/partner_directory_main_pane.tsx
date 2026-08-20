import type { PartnerDirectoryRow } from "@/domain/entities/partner_directory_row";
import { PartnerDirectoryDetailModal } from "@/presentation/components/partners/partner_directory_detail_modal";
import type { AdminPartnersActiveFilter } from "@/presentation/hooks/use_admin_partners_directory";
import { useAdminPartnersDirectory } from "@/presentation/hooks/use_admin_partners_directory";
import { useEffect, useMemo, useState } from "react";

export type PartnerDirectoryMainPaneProps = {
  onInspectRegisteredPartner: (row: PartnerDirectoryRow) => void;
};

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function IconInfo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSort() {
  return (
    <svg
      className="pp-orders-sort"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M8 6l4-4 4 4M8 18l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function statusLabel(s: PartnerDirectoryRow["status"]): string {
  switch (s) {
    case "active":
      return "Activo";
    case "pending":
      return "Pendiente";
    case "inactive":
      return "Inactivo";
  }
}

function statusPillClass(s: PartnerDirectoryRow["status"]): string {
  switch (s) {
    case "active":
      return "pp-orders-pill pp-orders-pill--ok";
    case "pending":
      return "pp-orders-pill pp-orders-pill--warn";
    case "inactive":
      return "pp-orders-pill pp-orders-pill--muted";
  }
}

function filterRows(rows: PartnerDirectoryRow[], q: string): PartnerDirectoryRow[] {
  const s = q.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter(
    (r) =>
      r.businessName.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.id.toLowerCase().includes(s) ||
      r.category.toLowerCase().includes(s) ||
      (r.ownerName && r.ownerName.toLowerCase().includes(s)) ||
      (r.phone && r.phone.toLowerCase().includes(s))
  );
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

export function PartnerDirectoryMainPane({
  onInspectRegisteredPartner,
}: PartnerDirectoryMainPaneProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<AdminPartnersActiveFilter>("active");
  const [detailRow, setDetailRow] = useState<PartnerDirectoryRow | null>(null);

  const { rows: apiRows, totalPages: serverPages, totalItems, loading, error } =
    useAdminPartnersDirectory({ page, activeFilter });

  const filtered = useMemo(() => filterRows(apiRows, search), [apiRows, search]);

  const totalPages = Math.max(1, serverPages);
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(totalPages, currentPage),
    [totalPages, currentPage]
  );

  const filterSelectId = "pp-directory-active-filter";

  return (
    <div className="pp-orders-pane">
      {error ? (
        <p className="pp-banner pp-banner--err" role="alert" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      ) : null}

      <section className="pp-orders-card" aria-labelledby="pp-directory-heading">
        <div className="pp-orders-toolbar">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", alignItems: "baseline" }}>
            <h2 id="pp-directory-heading" className="pp-orders-title">
              Partners registrados
            </h2>
            {!loading && !error ? (
              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {totalItems} en total · página {currentPage}/{totalPages}
              </span>
            ) : null}
          </div>
          <div className="pp-orders-tools" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
            <label htmlFor={filterSelectId} style={{ marginBottom: 0, minWidth: "10rem", display: "grid", gap: "0.3rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151" }}>Estado</span>
              <select
                id={filterSelectId}
                value={activeFilter}
                aria-label="Filtrar socios por estado"
                disabled={loading}
                onChange={(e) => {
                  setActiveFilter(e.target.value as AdminPartnersActiveFilter);
                  setPage(1);
                }}
              >
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="all">Todos</option>
              </select>
            </label>
            <label className="pp-orders-search">
              <IconSearch />
              <input
                type="search"
                placeholder="Buscar en esta página…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar socio, titular o email en esta página"
              />
            </label>
          </div>
        </div>

        <div className="pp-orders-table-wrap">
          <table className="pp-orders-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="pp-orders-th-inner">
                    ID
                    <IconSort />
                  </span>
                </th>
                <th scope="col">
                  <span className="pp-orders-th-inner">
                    SOCIO
                    <IconSort />
                  </span>
                </th>
                <th scope="col">
                  <span className="pp-orders-th-inner">
                    EMAIL
                    <IconSort />
                  </span>
                </th>
                <th scope="col">
                  <span className="pp-orders-th-inner">
                    TIPO
                    <IconSort />
                  </span>
                </th>
                <th scope="col">
                  <span className="pp-orders-th-inner">
                    ESTADO
                    <IconSort />
                  </span>
                </th>
                <th scope="col">
                  <span className="pp-orders-th-inner">
                    ALTA
                    <IconSort />
                  </span>
                </th>
                <th scope="col" className="pp-orders-th-actions">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="pp-orders-empty">
                    Cargando partners…
                  </td>
                </tr>
              ) : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="pp-orders-empty">
                    {search.trim()
                      ? "No hay coincidencias en esta página."
                      : "No hay socios para mostrar."}
                  </td>
                </tr>
              ) : null}
              {!loading
                ? filtered.map((row, i) => (
                    <tr
                      key={`${row.id}-${row.email}`}
                      className={i % 2 === 1 ? "pp-orders-tr--alt" : undefined}
                    >
                      <td className="pp-orders-mono">{row.id}</td>
                      <td>
                        <div className="pp-orders-client">
                          <span
                            className="pp-orders-avatar"
                            style={{ background: row.avatarColor }}
                            aria-hidden
                          >
                            {row.initial}
                          </span>
                          <span>{row.businessName}</span>
                        </div>
                      </td>
                      <td className="pp-orders-mono" style={{ fontSize: "0.78rem" }}>
                        {row.email}
                      </td>
                      <td>{row.category}</td>
                      <td>
                        <span className={statusPillClass(row.status)}>
                          <span className="pp-orders-pill-dot" aria-hidden />
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="pp-orders-time">{row.joinedAtLabel}</td>
                      <td>
                        <div className="pp-directory-row-actions">
                          <button
                            type="button"
                            className="pp-orders-icon-btn"
                            title="Ver dashboard como este partner"
                            aria-label={`Abrir vista de panel para ${row.businessName}`}
                            onClick={() => onInspectRegisteredPartner(row)}
                          >
                            <IconEye />
                          </button>
                          <button
                            type="button"
                            className="pp-orders-icon-btn"
                            title="Ver detalles del partner"
                            aria-label={`Ver detalles de ${row.businessName}`}
                            onClick={() => setDetailRow(row)}
                          >
                            <IconInfo />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 ? (
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
      </section>

      <PartnerDirectoryDetailModal
        open={detailRow != null}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />
    </div>
  );
}
