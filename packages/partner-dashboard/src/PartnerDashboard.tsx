import type { ReactNode } from "react";
import { Fragment, useMemo } from "react";
import "./partner_dashboard.css";
import {
  DashboardBagTypesChart,
  DashboardWeeklySalesChart,
  type DashboardBagTypesChartProps,
  type DashboardWeeklySalesChartProps,
} from "./dashboard_charts";
import {
  mockKpis,
  mockNav,
  mockOrders,
  type KpiCard,
  type OrderRow,
} from "./mock_data";

export type PartnerDashboardProps = {
  /** Logo superior sidebar (URL pública de la app). */
  brandLogoSrc?: string;
  partnerName?: string;
  partnerTag?: string;
  /** Texto o iniciales en el avatar del comercio (fallback si no hay foto). */
  partnerInitial?: string;
  /** Foto de perfil del comercio; si falta, se muestran las iniciales. */
  partnerPhotoSrc?: string | null;
  onSignOut?: () => void;
  /** Reemplaza el contenido KPI/gráficas/tabla cuando se usa otra vista (ej. perfil). */
  mainPane?: ReactNode;
  /** Título en el encabezado del área principal. */
  pageTitle?: string;
  /** Si se define, sustituye el bloque derecho del header (calendario + campana). */
  headerTools?: ReactNode;
  /** Ítem activo del menú (`dashboard`, `orders`, `products`, `partners`, `metrics`, `profile`). */
  activeNavId?: string;
  onNavItemClick?: (navId: string) => void;
  /**
   * Rol del usuario (p. ej. desde `user.role` en el login).
   * Solo si es `admin` (insensible a mayúsculas) se muestra el ítem **Partners** en el menú.
   */
  partnerRole?: string | null;
  /** KPIs del resumen (p. ej. `GET /partners/dashboard`). Si no se pasan, se usan mocks. */
  kpis?: KpiCard[];
  /** Órdenes recientes del panel. Si no se pasan, se usan mocks. */
  orders?: OrderRow[];
  /** Cargando datos del dashboard desde API. */
  dashboardLoading?: boolean;
  /** Error al cargar el dashboard (se muestra un aviso sobre los KPIs/tabla). */
  dashboardError?: string | null;
  /** Al pulsar «Descargar reporte» en la tabla del dashboard. */
  onDownloadReportClick?: () => void;
  /**
   * Restringe ítems del menú lateral (`id` de `mockNav`). Útil para flujos de administrador.
   * Si no se pasa, se aplican las reglas por defecto (p. ej. «Partners» sólo para rol admin).
   */
  navItemWhitelist?: readonly string[] | null;
  /** Aviso fijo (chip / diálogo ligero) sobre el layout, p. ej. contexto de impersonación. */
  floatingNotice?: ReactNode;
  /** Datos del gráfico de ventas (`line_chart` del API). */
  weeklySalesChart?: DashboardWeeklySalesChartProps;
  /** Datos del gráfico de tipos (`bar_chart` del API). */
  bagTypesChart?: DashboardBagTypesChartProps;
  /** Textos del gráfico de ventas (dashboard: semana fija). */
  salesChartTitle?: string;
  salesChartSubtitle?: string;
};

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NavIcon({
  kind,
}: {
  kind: "grid" | "bag" | "box" | "partners" | "chart" | "user";
}) {
  const stroke = "currentColor";
  const sw = 1.8;
  switch (kind) {
    case "grid":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="4" width="6" height="6" rx="1" stroke={stroke} strokeWidth={sw} />
          <rect x="14" y="4" width="6" height="6" rx="1" stroke={stroke} strokeWidth={sw} />
          <rect x="4" y="14" width="6" height="6" rx="1" stroke={stroke} strokeWidth={sw} />
          <rect x="14" y="14" width="6" height="6" rx="1" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "bag":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 9h12v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9z"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path d="M9 9V7a3 3 0 016 0v2" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "box":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" stroke={stroke} strokeWidth={sw} />
          <path d="M4 8l8 4M12 12v8M20 8l-8 4" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "partners":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="9" cy="8.5" r="2.5" stroke={stroke} strokeWidth={sw} />
          <circle cx="16" cy="7.5" r="2" stroke={stroke} strokeWidth={sw} />
          <path
            d="M4 20v-1c0-1.8 1.5-3.25 3.4-3.25h2.9c.23 0 .45.02.67.06M15.3 15.75c2 0 3.7 1.35 4.7 3.25"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d="M14 11.2c-1.1.4-1.9 1.4-2 2.6-.5-.2-1-.35-1.55-.45"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case "chart":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 19V5M4 19h16" stroke={stroke} strokeWidth={sw} />
          <path d="M8 15l3-4 4 6 5-10" stroke={stroke} strokeWidth={sw} fill="none" />
        </svg>
      );
    case "user":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="9" r="3.5" stroke={stroke} strokeWidth={sw} />
          <path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
}

function IconGear() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2M12 20v2M22 12h-2M4 12H2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconExit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 3v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div
      className="pd-spark"
      style={{ color: up ? "var(--pd-green)" : "var(--pd-red)" }}
      aria-hidden
    >
      {values.map((v, i) => {
        const barH = 6 + ((v - min) / range) * 18;
        return (
          <span key={i} style={{ height: `${barH}px`, alignSelf: "flex-end" }} />
        );
      })}
    </div>
  );
}

function canonicalPortalRoleToken(role: string): string {
  return role.trim().toLowerCase().replace(/^role_/, "");
}

function isAdminRole(role: string | null | undefined): boolean {
  return (
    typeof role === "string" &&
    role.trim().length > 0 &&
    canonicalPortalRoleToken(role) === "admin"
  );
}

function statusClass(s: OrderRow["status"]): string {
  switch (s) {
    case "Pendiente":
      return "pd-pill pd-pill--pend";
    case "Confirmada":
      return "pd-pill pd-pill--conf";
    case "Por recoger":
      return "pd-pill pd-pill--pick";
    case "Recogida":
      return "pd-pill pd-pill--done";
    case "Cancelada":
      return "pd-pill pd-pill--fail";
  }
}

export function PartnerDashboard({
  brandLogoSrc = "/partners/logo_hb_partners.svg",
  partnerName = "La Piazza",
  partnerTag = "Restaurante italiano",
  partnerInitial = "LP",
  partnerPhotoSrc,
  onSignOut,
  mainPane,
  pageTitle,
  headerTools,
  activeNavId,
  onNavItemClick,
  partnerRole = null,
  kpis: kpisProp,
  orders: ordersProp,
  dashboardLoading = false,
  dashboardError = null,
  onDownloadReportClick,
  navItemWhitelist = null,
  floatingNotice,
  weeklySalesChart,
  bagTypesChart,
  salesChartTitle = "Ventas de la semana",
  salesChartSubtitle = "Ingresos en soles (S/)",
}: PartnerDashboardProps) {
  const kpis = kpisProp ?? mockKpis;
  const orders = ordersProp ?? mockOrders;

  const navItems = useMemo(() => {
    const base = mockNav.filter(
      (item) => item.id !== "partners" || isAdminRole(partnerRole)
    );
    if (!navItemWhitelist || navItemWhitelist.length === 0) return base;
    const allow = new Set(navItemWhitelist);
    return base.filter((item) => allow.has(item.id));
  }, [partnerRole, navItemWhitelist]);

  const sidebarPhotoSrc = partnerPhotoSrc?.trim() ?? "";
  const sidebarInitials = partnerInitial.slice(0, 2).toUpperCase();

  return (
    <Fragment>
      <div className="pd-root">
      <aside className="pd-sidebar">
        <div className="pd-sidebar-brand">
          <img src={brandLogoSrc} alt="Happy Bag" />
        </div>
        <label className="pd-sidebar-search">
          <IconSearch />
          <input type="search" placeholder="Buscar" readOnly aria-label="Buscar" />
        </label>
        <nav aria-label="Principal">
          <ul className="pd-nav">
            {navItems.map((item) => {
              const navActive =
                activeNavId != null ? item.id === activeNavId : item.active;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={navActive ? "pd-nav--active" : undefined}
                    onClick={() => onNavItemClick?.(item.id)}
                  >
                    <NavIcon kind={item.icon} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="pd-sidebar-spacer" />
        <div className="pd-sidebar-user">
          <div
            className={`pd-sidebar-user-avatar${
              sidebarPhotoSrc ? " pd-sidebar-user-avatar--photo" : ""
            }`}
            aria-hidden
          >
            {sidebarPhotoSrc ? (
              <img className="pd-sidebar-user-avatar-img" src={sidebarPhotoSrc} alt="" />
            ) : (
              sidebarInitials
            )}
          </div>
          <div className="pd-sidebar-user-meta">
            <div className="pd-sidebar-user-name">{partnerName}</div>
            <span className="pd-tag">{partnerTag}</span>
          </div>
        </div>
        <div className="pd-sidebar-foot">
          <button type="button">
            <IconGear />
            Configuración
          </button>
          <button type="button" onClick={() => onSignOut?.()}>
            <IconExit />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="pd-main">
        <header className="pd-main-header">
          <div className="pd-main-title">
            <button type="button" className="pd-icon-btn" aria-label="Atrás">
              ←
            </button>
            <h1>{pageTitle ?? "Dashboard"}</h1>
          </div>
          <div className="pd-main-tools">
            {headerTools ?? (
              <>
                <div className="pd-select-like">
                  <IconCalendar />
                  Hoy
                </div>
                <button type="button" className="pd-icon-btn" aria-label="Notificaciones">
                  <IconBell />
                </button>
              </>
            )}
          </div>
        </header>

        {mainPane ? (
          <div className="pd-custom-main">{mainPane}</div>
        ) : (
          <>
            {dashboardError ? (
              <p className="pd-dashboard-alert" role="alert">
                {dashboardError}
              </p>
            ) : null}
            <section className="pd-kpis" aria-label="Resumen del día">
              {kpis.map((k) => (
                <article
                  key={k.title}
                  className={dashboardLoading ? "pd-kpi pd-kpi--loading" : "pd-kpi"}
                >
                  <h3>{k.title}</h3>
                  <div className="pd-kpi-value">{dashboardLoading ? "…" : k.value}</div>
                  <div className="pd-kpi-foot">
                    <span
                      className={
                        k.trendUp
                          ? "pd-trend pd-trend--up"
                          : "pd-trend pd-trend--down"
                      }
                    >
                      {k.trendLabel}
                    </span>
                    <Sparkline values={k.spark} up={k.trendUp} />
                  </div>
                </article>
              ))}
            </section>

            <section className="pd-charts" aria-label="Gráficos">
              <article className="pd-chart-card">
                <header className="pd-chart-card-head">
                  <div>
                    <h2>{salesChartTitle}</h2>
                    <p className="pd-chart-sub">{salesChartSubtitle}</p>
                  </div>
                  <span className="pd-badge-green">▲ 18% semanal</span>
                </header>
                <DashboardWeeklySalesChart {...weeklySalesChart} />
              </article>
              <article className="pd-chart-card">
                <header className="pd-chart-card-head">
                  <div>
                    <h2>Tipos de Happy Bag</h2>
                    <p className="pd-chart-sub">Distribución de ventas</p>
                  </div>
                </header>
                <DashboardBagTypesChart {...bagTypesChart} />
              </article>
            </section>

            <section className="pd-table-card" aria-label="Órdenes recientes">
              <div className="pd-table-head">
                <h2>Órdenes recientes</h2>
                <div className="pd-table-tools">
                  <label className="pd-table-search">
                    <IconSearch />
                    <input type="search" placeholder="Buscar" readOnly />
                  </label>
                  <button
                    type="button"
                    className="pd-btn-outline"
                    onClick={() => onDownloadReportClick?.()}
                  >
                    ↓ Descargar reporte
                  </button>
                </div>
              </div>
              <div className="pd-table-wrap">
                <table className="pd-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>
                        <span className="pd-sr-only">Seleccionar</span>
                      </th>
                      <th>Orden</th>
                      <th>Cliente</th>
                      <th>Producto</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>H. recojo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardLoading ? (
                      <tr>
                        <td colSpan={8} className="pd-table-empty">
                          Cargando órdenes…
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="pd-table-empty">
                          No hay órdenes para mostrar.
                        </td>
                      </tr>
                    ) : null}
                    {!dashboardLoading &&
                      orders.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <input type="checkbox" disabled aria-label={`Seleccionar ${row.id}`} />
                        </td>
                        <td>{row.id}</td>
                        <td>
                          <div className="pd-cell-user">
                            <span
                              className="pd-avatar"
                              style={{ background: row.avatarColor }}
                            >
                              {row.initial}
                            </span>
                            {row.customer}
                          </div>
                        </td>
                        <td>{row.product}</td>
                        <td>{row.total}</td>
                        <td>
                          <span className={statusClass(row.status)}>{row.status}</span>
                        </td>
                        <td>{row.pickup}</td>
                        <td>
                          <div className="pd-actions">
                            <button type="button" aria-label="Ver">
                              ◉
                            </button>
                            <button type="button" aria-label="Editar">
                              ✎
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>

    {floatingNotice ? (
      <div className="pd-floating-notice" aria-live="polite">
        {floatingNotice}
      </div>
    ) : null}
  </Fragment>
  );
}
