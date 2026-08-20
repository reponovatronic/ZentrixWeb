import {
  deletePartnerProduct,
  fetchMyProducts,
  setProductListingActive,
} from "@/data/http/partner_products_client";
import type { PartnerProductListRow } from "@/domain/entities/partner_product";
import { AdminPartnerViewBanner } from "@/presentation/components/partners/admin_partner_view_banner";
import { PartnerPanelHeaderTools } from "@/presentation/components/partners/partner_panel_header_tools";
import { PartnerProductDeleteConfirmModal } from "@/presentation/components/partners/partner_product_delete_confirm_modal";
import { PartnerProductFormModal } from "@/presentation/components/partners/partner_product_form_modal";
import { usePartnersPortalRedirects } from "@/presentation/hooks/use_partners_portal_redirects";
import { usePartnerPortalNavWhitelist } from "@/presentation/hooks/use_partner_portal_nav_whitelist";
import { useEffectivePortalPartnerId } from "@/presentation/hooks/use_effective_portal_partner_id";
import { usePartnerDashboardFilters } from "@/presentation/hooks/use_partner_dashboard_filters";
import {
  PartnerProductsMainPane,
  type ProductStatusFilter,
} from "@/presentation/components/partners/partner_products_main_pane";
import { useAdminPartnerViewStore } from "@/presentation/stores/admin_partner_view_store";
import { usePartnerSessionStore } from "@/presentation/stores/partner_session_store";
import {
  isAdminPartnerImpersonationActive,
} from "@/presentation/utils/admin_partner_session_scope";
import {
  partnerInitialsPartner,
  isPartnerAdminRole,
  partnerPhotoSrc,
} from "@/presentation/utils/partner_display_utils";
import { PartnerDashboard } from "@happy-bags/partner-dashboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/presentation/styles/partners_products.css";

export function PartnersProductsPage() {
  const navigate = useNavigate();
  usePartnersPortalRedirects({ requireAdminImpersonation: true });
  const status = usePartnerSessionStore((s) => s.status);
  const partner = usePartnerSessionStore((s) => s.partner);
  const signOut = usePartnerSessionStore((s) => s.signOut);
  const viewedPartnerId = useAdminPartnerViewStore((s) => s.viewedPartnerId);
  const scopedToPortalUserId = useAdminPartnerViewStore((s) => s.scopedToPortalUserId);
  const effectivePartnerId = useEffectivePortalPartnerId();
  const navWhitelist = usePartnerPortalNavWhitelist();

  const [items, setItems] = useState<PartnerProductListRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerProductListRow | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryApiIdHint, setCategoryApiIdHint] = useState<number | null>(null);
  const periodFilter = usePartnerDashboardFilters();

  const listAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(t);
  }, [search]);

  /** Productos sólo rol socio; admin con vista de socio no debe ver este módulo. */
  useEffect(() => {
    if (status === "loading" || !partner) return;
    if (
      isPartnerAdminRole(partner.role) &&
      isAdminPartnerImpersonationActive(
        partner,
        viewedPartnerId,
        scopedToPortalUserId
      )
    ) {
      navigate("/partners/panel", { replace: true });
    }
  }, [
    status,
    partner,
    navigate,
    viewedPartnerId,
    scopedToPortalUserId,
  ]);

  const loadProducts = useCallback(async () => {
    listAbortRef.current?.abort();
    const ac = new AbortController();
    listAbortRef.current = ac;
    setListLoading(true);
    setListError(null);
    try {
      const isActive =
        statusFilter === "all" ? undefined : statusFilter === "active" ? true : false;
      const res = await fetchMyProducts({
        search: debouncedSearch.trim() || undefined,
        isActive,
        page: 1,
        limit: 80,
        signal: ac.signal,
        scopedPartnerId: effectivePartnerId,
      });
      setItems(res.items);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setListError(e instanceof Error ? e.message : "No se pudieron cargar los productos.");
      setItems([]);
    } finally {
      setListLoading(false);
    }
  }, [debouncedSearch, statusFilter, effectivePartnerId]);

  useEffect(() => {
    if (status === "loading" || !partner) return;
    void loadProducts();
  }, [status, partner, loadProducts]);

  async function handleSignOut() {
    await signOut();
    navigate("/partners");
  }

  function navClick(id: string) {
    if (id === "dashboard") navigate("/partners/panel");
    if (id === "orders") navigate("/partners/orders");
    if (id === "products") navigate("/partners/products");
    if (id === "partners") navigate("/partners/directory");
    if (id === "metrics") navigate("/partners/metrics");
    if (id === "profile") navigate("/partners/profile");
  }

  function openCreateModal(): void {
    setEditingId(null);
    setCategoryApiIdHint(null);
    setModalOpen(true);
  }

  function openEditModal(p: PartnerProductListRow): void {
    setEditingId(p.id);
    setCategoryApiIdHint(p.categoryApiId);
    setModalOpen(true);
  }

  async function handleToggleListing(p: PartnerProductListRow, next: boolean): Promise<void> {
    setTogglingId(p.id);
    const prev = p.isActive;
    setItems((rows) =>
      rows.map((r) => (r.id === p.id ? { ...r, isActive: next } : r))
    );
    try {
      await setProductListingActive(p.id, next, undefined, effectivePartnerId);
    } catch (e: unknown) {
      setItems((rows) =>
        rows.map((r) => (r.id === p.id ? { ...r, isActive: prev } : r))
      );
      window.alert(e instanceof Error ? e.message : "No se pudo actualizar el estado.");
    } finally {
      setTogglingId(null);
    }
  }

  function requestDelete(p: PartnerProductListRow): void {
    setDeleteError(null);
    setDeleteTarget(p);
  }

  function closeDeleteDialog(): void {
    if (deletingId) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    setDeleteError(null);
    try {
      await deletePartnerProduct(deleteTarget.id, undefined, effectivePartnerId);
      setItems((rows) => rows.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : "No se pudo eliminar el producto.");
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || !partner) {
    return (
      <div className="pd-panel-loading">
        <p>Cargando…</p>
      </div>
    );
  }

  return (
    <>
      <PartnerDashboard
        partnerName={partner.displayName}
        partnerTag="Socio Happy Bag"
        partnerInitial={partnerInitialsPartner(partner)}
        partnerPhotoSrc={partnerPhotoSrc(partner)}
        partnerRole={partner.role}
        navItemWhitelist={navWhitelist ? [...navWhitelist] : null}
        floatingNotice={<AdminPartnerViewBanner />}
        onSignOut={handleSignOut}
        pageTitle="Mis productos"
        activeNavId="products"
        headerTools={
          <PartnerPanelHeaderTools
            presetId={periodFilter.presetId}
            onPresetChange={periodFilter.setPresetId}
            customRange={periodFilter.customRange}
            onCustomRangeChange={periodFilter.setCustomRange}
          />
        }
        mainPane={
          <PartnerProductsMainPane
            items={items}
            loading={listLoading}
            listError={listError}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            togglingId={togglingId}
            deletingId={deletingId}
            onToggleListing={handleToggleListing}
            onEdit={openEditModal}
            onDelete={requestDelete}
            catalogLooksEmpty={debouncedSearch.trim() === "" && statusFilter === "all"}
            onAddProduct={openCreateModal}
          />
        }
        onNavItemClick={navClick}
      />

      <PartnerProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        editingProductId={editingId}
        categoryApiIdHint={categoryApiIdHint}
        scopedPartnerId={effectivePartnerId}
        onSaved={() => void loadProducts()}
      />

      <PartnerProductDeleteConfirmModal
        open={deleteTarget != null}
        product={deleteTarget}
        deleting={deletingId != null}
        error={deleteError}
        onClose={closeDeleteDialog}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
