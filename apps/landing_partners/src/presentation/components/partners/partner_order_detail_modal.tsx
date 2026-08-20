import type { AdminOrderDetail } from "@/domain/entities/admin_order";
import { orderAllowsPartnerStatusActions } from "@/presentation/mappers/admin_orders_mapper";
import { isPartnerBusinessRole } from "@/presentation/utils/partner_display_utils";
import { useEffect } from "react";
import "@/presentation/styles/partner_order_detail_modal.css";

export type PartnerOrderDetailModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  detail: AdminOrderDetail | null;
  actionBusy?: boolean;
  actionError?: string | null;
  /** Solo rol `partner` (no admin). */
  partnerRole?: string | null;
  onClose: () => void;
  onAccept?: () => void;
  onReject?: () => void;
};

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PartnerOrderDetailModal({
  open,
  loading,
  error,
  detail,
  actionBusy = false,
  actionError = null,
  partnerRole = null,
  onClose,
  onAccept,
  onReject,
}: PartnerOrderDetailModalProps) {
  const showActions =
    isPartnerBusinessRole(partnerRole) &&
    detail != null &&
    orderAllowsPartnerStatusActions(detail.status);
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pp-order-modal-root" role="presentation">
      <button
        type="button"
        className="pp-order-modal-backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="pp-order-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-order-modal-title"
      >
        <header className="pp-order-modal-head">
          <div>
            <h2 id="pp-order-modal-title">
              Orden {detail?.orderCode ?? "…"}
            </h2>
            {detail ? (
              <p className="pp-order-modal-sub">
                {detail.createdAtLabel} | Pago: {detail.paymentMethod}
              </p>
            ) : null}
          </div>
          <button type="button" className="pp-order-modal-close" onClick={onClose}>
            <IconClose />
          </button>
        </header>

        {loading ? <p className="pp-order-modal-msg">Cargando detalle…</p> : null}
        {error ? (
          <p className="pp-order-modal-msg pp-order-modal-msg--error" role="alert">
            {error}
          </p>
        ) : null}

        {detail && !loading ? (
          <div className="pp-order-modal-body">
            <ol className="pp-order-modal-steps" aria-label="Estado de la orden">
              {detail.progressSteps.map((step) => (
                <li
                  key={step.key}
                  className={
                    step.active
                      ? "pp-order-modal-step pp-order-modal-step--active"
                      : step.done
                        ? "pp-order-modal-step pp-order-modal-step--done"
                        : "pp-order-modal-step"
                  }
                >
                  <span className="pp-order-modal-step-dot" aria-hidden />
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>

            <section className="pp-order-modal-section">
              <h3>Productos</h3>
              {detail.products.length === 0 ? (
                <p className="pp-order-modal-muted">Sin productos en la respuesta.</p>
              ) : (
                <ul className="pp-order-modal-products">
                  {detail.products.map((p) => (
                    <li key={p.id || p.name} className="pp-order-modal-product">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="pp-order-modal-product-img" />
                      ) : (
                        <span className="pp-order-modal-product-img pp-order-modal-product-img--ph" />
                      )}
                      <div className="pp-order-modal-product-meta">
                        <div className="pp-order-modal-product-row">
                          <span className="pp-order-modal-pill">{p.statusLabel}</span>
                          <strong>
                            {p.name} | {p.priceDisplay}
                          </strong>
                        </div>
                        <p className="pp-order-modal-muted">
                          {p.storeName}
                          {p.pickupWindow !== "—" ? ` | ${p.pickupWindow}` : ""}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="pp-order-modal-section">
              <h3>Resumen</h3>
              <dl className="pp-order-modal-summary">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{detail.subtotalDisplay}</dd>
                </div>
                <div>
                  <dt>Ahorro</dt>
                  <dd className="pp-order-modal-savings">{detail.savingsDisplay}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd className="pp-order-modal-total">{detail.totalDisplay}</dd>
                </div>
              </dl>
            </section>

            <section className="pp-order-modal-section pp-order-modal-pickup">
              <h3>Recojo</h3>
              <p className="pp-order-modal-pickup-time">{detail.pickupWindow}</p>
              {detail.pickupNote ? (
                <p className="pp-order-modal-muted">{detail.pickupNote}</p>
              ) : null}
            </section>

            {actionError ? (
              <p className="pp-order-modal-msg pp-order-modal-msg--error" role="alert">
                {actionError}
              </p>
            ) : null}

            {showActions ? (
              <footer className="pp-order-modal-actions">
                <button
                  type="button"
                  className="pp-order-modal-btn pp-order-modal-btn--ghost"
                  disabled={actionBusy}
                  onClick={() => onReject?.()}
                >
                  {actionBusy ? "Procesando…" : "Rechazar orden"}
                </button>
                <button
                  type="button"
                  className="pp-order-modal-btn pp-order-modal-btn--primary"
                  disabled={actionBusy}
                  onClick={() => onAccept?.()}
                >
                  {actionBusy ? "Procesando…" : "Aceptar orden"}
                </button>
              </footer>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
