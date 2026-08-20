import type { PartnerProductListRow } from "@/domain/entities/partner_product";
import { PartnerProductListImage } from "@/presentation/components/partners/partner_product_list_image";

export type ProductStatusFilter = "all" | "active" | "inactive";

export type PartnerProductsMainPaneProps = {
  items: PartnerProductListRow[];
  loading: boolean;
  listError: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: ProductStatusFilter;
  onStatusFilterChange: (v: ProductStatusFilter) => void;
  togglingId: string | null;
  deletingId: string | null;
  onToggleListing: (product: PartnerProductListRow, next: boolean) => void;
  onEdit: (product: PartnerProductListRow) => void;
  onDelete: (product: PartnerProductListRow) => void;
  /** Catálogo realmente vacío (sin filtros de búsqueda / estado). */
  catalogLooksEmpty: boolean;
  /** Abre el flujo crear producto (botón tipo Figma en cabecera de contenido). */
  onAddProduct: () => void;
  onView?: (product: PartnerProductListRow) => void;
};

function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPaperBagSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 11V9a3 3 0 016 0v2M7 11h10v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClockSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M12 8v5l3 2"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
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

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 000-2.83l-1.67-1.67a2 2 0 00-2.83 0L4 16.17V20z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 6l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M9 7V4h6v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Barra inferior tipo Figma — visual según nivel de inventario disponible (sin campo “vendidos” del API). */
function availabilityPercent(stock: number): number {
  if (!(stock >= 0) || Number.isNaN(stock)) return 8;
  return Math.round(Math.min(100, Math.max(10, Math.min(stock / 40, 1) * 100)));
}

function ChevronSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyCatalogIllustration() {
  return (
    <div className="pp-empty-bag-mark" aria-hidden>
      <div className="pp-empty-box" />
      <svg
        className="pp-empty-bag-svg"
        width="112"
        height="112"
        viewBox="0 0 120 120"
        fill="none"
      >
        <path
          d="M40 54h40v52a8 8 0 01-8 8H48a8 8 0 01-8-8V54z"
          fill="#F4364C"
          opacity="0.92"
        />
        <path
          d="M44 54V42c0-8.837 7.163-16 16-16s16 7.163 16 16v12"
          stroke="#B91C1C"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="60" cy="72" r="10" fill="#FEF2F3" stroke="#FECDD3" strokeWidth="3" />
        <path d="M60 69v10M55 74h10" stroke="#F4364C" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="60" cy="102" rx="38" ry="10" fill="#131a2f" opacity="0.06" />
      </svg>
    </div>
  );
}

export function PartnerProductsMainPane({
  items,
  loading,
  listError,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  togglingId,
  deletingId,
  onToggleListing,
  onEdit,
  onDelete,
  catalogLooksEmpty,
  onAddProduct,
  onView,
}: PartnerProductsMainPaneProps) {
  const showIllustratedEmpty =
    catalogLooksEmpty && !loading && !listError && items.length === 0;
  const showFilteredEmpty =
    !catalogLooksEmpty && !loading && !listError && items.length === 0;

  return (
    <div className="pp-products-pane">
      <div className="pp-products-header">
        <div className="pp-products-header-copy">
          <p className="pp-products-header-title">Mis productos</p>
          <p className="pp-products-header-sub">Gestiona el catálogo de bolsos de tu negocio</p>
        </div>
        <div className="pp-products-header-tools">
          <div className="pp-filter-chip-wrap">
            <select
              className="pp-filter-chip-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as ProductStatusFilter)}
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <span className="pp-filter-chip-chevron" aria-hidden>
              <ChevronSmall />
            </span>
          </div>
          <div className="pp-search-actions-row">
            <label className="pp-search-m3">
              <input
                type="search"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                autoComplete="off"
                aria-label="Buscar producto"
              />
              <span className="pp-search-m3-btn" aria-hidden>
                <IconSearch />
              </span>
            </label>
            <button type="button" className="pp-btn-rounded-primary" onClick={onAddProduct}>
              <IconPlus />
              Nuevo producto
            </button>
          </div>
        </div>
      </div>

      {listError ? <div className="pp-msg pp-msg--err">{listError}</div> : null}

      {loading ? (
        <div className="pp-loading-block">
          <div className="pp-linear-loading" aria-hidden />
          <p className="pp-msg pp-msg--info pp-msg--inline">Cargando productos…</p>
        </div>
      ) : showIllustratedEmpty ? (
        <div className="pp-catalog-empty-state">
          <EmptyCatalogIllustration />
          <div className="pp-catalog-empty-text">
            <h2>Sin productos</h2>
            <p>
              Aún no has agregado productos.
              <br /> Agrega tu primer producto para comenzar.
            </p>
          </div>
          <button type="button" className="pp-btn-rounded-primary pp-btn-rounded-primary-lg" onClick={onAddProduct}>
            <IconPlus />
            Nuevo producto
          </button>
        </div>
      ) : showFilteredEmpty ? (
        <div className="pp-filtered-empty-state">
          <p className="pp-filtered-empty-title">Sin resultados</p>
          <p className="pp-filtered-empty-sub">Prueba otra búsqueda o cambia el filtro.</p>
        </div>
      ) : (
        <div className="pp-products-grid">
          {items.map((p) => {
            const avail = availabilityPercent(p.stockCount);
            return (
              <article key={p.id} className="pp-product-card">
                <div className="pp-product-card-top">
                  <div className="pp-product-badges-row">
                    <span
                      className={
                        p.isActive ? "pp-m3-status pp-m3-status--on" : "pp-m3-status pp-m3-status--off"
                      }
                    >
                      <span className="pp-m3-status-dot" aria-hidden />
                      {p.isActive ? "Activa" : "Inactiva"}
                    </span>
                    <span className="pp-m3-mini-badge pp-m3-mini-badge-stock">
                      <IconPaperBagSmall /> {p.stockCount} en stock
                    </span>
                    {p.scheduleLabel ? (
                      <span className="pp-m3-mini-badge pp-m3-mini-badge-schedule">
                        <IconClockSmall /> {p.scheduleLabel}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={p.isActive ? "pp-switch pp-switch--on" : "pp-switch"}
                    disabled={togglingId === p.id}
                    onClick={() => onToggleListing(p, !p.isActive)}
                    aria-label={p.isActive ? "Desactivar en catálogo" : "Activar en catálogo"}
                    aria-pressed={p.isActive}
                  />
                </div>

                <div className="pp-product-body-figma">
                  <div className="pp-product-thumb-wrap">
                    <PartnerProductListImage imageUrl={p.imageUrl} productName={p.name} />
                  </div>
                  <div className="pp-product-info-col">
                    <div className="pp-product-title-row">
                      <h3 className="pp-product-title">{p.name}</h3>
                      <div className="pp-product-actions">
                        <button
                          type="button"
                          aria-label="Ver detalle"
                          onClick={() => (onView ?? onEdit)(p)}
                        >
                          <IconEye />
                        </button>
                        <button type="button" aria-label="Editar" onClick={() => onEdit(p)}>
                          <IconPencil />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar"
                          disabled={deletingId === p.id}
                          onClick={() => onDelete(p)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                    <p className="pp-product-desc">{p.description || "Sin descripción"}</p>
                    <div className="pp-product-prices pp-product-prices-figma">
                      <span className="pp-price-offer">{p.offerPriceLabel}</span>
                      <span className="pp-price-original">{p.originalPriceLabel}</span>
                      {p.discountLabel ? (
                        <span className="pp-discount-badge">{p.discountLabel}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="pp-avail-bar" role="presentation" aria-hidden>
                  <div className="pp-avail-track" />
                  <div className="pp-avail-fill" style={{ width: `${avail}%` }} />
                  <span className="pp-avail-knob" style={{ left: `calc(${avail}% - 2px)` }} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
