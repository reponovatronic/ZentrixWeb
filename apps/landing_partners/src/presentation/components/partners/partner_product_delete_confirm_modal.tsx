import type { PartnerProductListRow } from "@/domain/entities/partner_product";
import { PartnerProductListImage } from "@/presentation/components/partners/partner_product_list_image";
import { useEffect, useId } from "react";

export type PartnerProductDeleteConfirmModalProps = {
  open: boolean;
  product: PartnerProductListRow | null;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

function IconTrashLarge() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 6h18M8 6V4h8v2m-1 4v8M9 10v8M15 10v8M6 6l1 14h10l1-14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PartnerProductDeleteConfirmModal({
  open,
  product,
  deleting,
  error,
  onClose,
  onConfirm,
}: PartnerProductDeleteConfirmModalProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting, onClose]);

  if (!open || !product) return null;

  return (
    <div
      className="pp-modal-overlay pp-delete-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onMouseDown={(ev) => {
        if (!deleting && ev.target === ev.currentTarget) onClose();
      }}
    >
      <div className="pp-modal-card pp-delete-card">
        <div className="pp-delete-icon-wrap" aria-hidden>
          <IconTrashLarge />
        </div>

        <h2 id={titleId} className="pp-delete-title">
          ¿Eliminar este producto?
        </h2>
        <p id={descId} className="pp-delete-desc">
          Se quitará del catálogo de forma permanente. Las órdenes ya registradas no se modifican.
        </p>

        <div className="pp-delete-product-preview">
          <div className="pp-delete-product-thumb">
            <PartnerProductListImage imageUrl={product.imageUrl} productName={product.name} />
          </div>
          <div className="pp-delete-product-meta">
            <strong>{product.name}</strong>
            <span>{product.offerPriceLabel}</span>
            {product.scheduleLabel ? <span>{product.scheduleLabel}</span> : null}
          </div>
        </div>

        {error ? <div className="pp-msg pp-msg--err">{error}</div> : null}

        <div className="pp-delete-actions">
          <button
            type="button"
            className="pp-btn-ghost"
            disabled={deleting}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="pp-btn-delete-confirm"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
