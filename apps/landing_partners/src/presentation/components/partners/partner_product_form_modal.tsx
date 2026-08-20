import {
  categoryApiIdFromDraftId,
  PARTNER_PRODUCT_CATEGORIES,
} from "@/domain/entities/partner_product";
import {
  createPartnerProduct,
  encodeAvailableDaysForApi,
  fetchProductForEdit,
  updatePartnerProduct,
  type PartnerProductEditPayload,
} from "@/data/http/partner_products_client";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
}

function fileNameHintFromUrl(url: string): string {
  const base = url.split("?")[0] ?? url;
  const seg = base.split("/").filter(Boolean).pop();
  if (seg && seg.length > 0 && seg.length < 96) {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  }
  return "Imagen";
}

export type PartnerProductFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** Si está definido, modo edición. */
  editingProductId: string | null;
  /** Desde la fila de lista cuando el GET no trae categoría. */
  categoryApiIdHint: number | null;
  onSaved: () => void;
  /** Admin viendo otro socio: se añade `partner_id` en URLs compatibles. */
  scopedPartnerId?: string;
};

type FieldErrors = Partial<Record<string, string>>;

type FormDraft = PartnerProductEditPayload & { imageFile: File | null };

function defaultForm(): FormDraft {
  return {
    name: "",
    description: "",
    originalPrice: null,
    offerPrice: null,
    stock: 1,
    pickupStart: "12:00",
    pickupEnd: "14:00",
    /** Debe existir en `PARTNER_PRODUCT_CATEGORIES` (“pizza” no está en lista). */
    categoryDraftId: "sushi",
    existingImageUrl: null,
    availableDayNums: [1, 2, 3, 4, 5, 6, 7],
    onlyAtClosing: false,
    imageFile: null,
  };
}

function validate(draft: FormDraft, isEdit: boolean): FieldErrors {
  const e: FieldErrors = {};
  if (!draft.name.trim()) e.name = "El nombre es obligatorio.";
  if (draft.originalPrice == null || draft.originalPrice <= 0) {
    e.originalPrice = "Precio original inválido.";
  }
  if (draft.offerPrice == null || draft.offerPrice <= 0) {
    e.offerPrice = "Precio de oferta inválido.";
  } else if (draft.originalPrice != null && draft.offerPrice > draft.originalPrice) {
    e.offerPrice = "La oferta no puede ser mayor que el precio original.";
  }
  if (draft.stock <= 0) e.stock = "Stock inválido.";
  if (!draft.categoryDraftId?.trim()) e.category = "Elige una categoría.";
  else if (categoryApiIdFromDraftId(draft.categoryDraftId) == null) {
    e.category = "Categoría no válida.";
  }
  if (draft.availableDayNums.length === 0) e.days = "Elige al menos un día.";
  const hhmm = /^\d{2}:\d{2}$/;
  if (!draft.pickupStart.trim() || !hhmm.test(draft.pickupStart)) {
    e.pickupStart = "Hora inválida (HH:mm).";
  }
  if (!draft.pickupEnd.trim() || !hhmm.test(draft.pickupEnd)) {
    e.pickupEnd = "Hora inválida (HH:mm).";
  }
  if (
    !e.pickupStart &&
    !e.pickupEnd &&
    hhmm.test(draft.pickupStart) &&
    hhmm.test(draft.pickupEnd)
  ) {
    const [h1, m1] = draft.pickupStart.split(":").map(Number);
    const [h2, m2] = draft.pickupEnd.split(":").map(Number);
    const a = h1 * 60 + m1;
    const b = h2 * 60 + m2;
    if (b <= a) e.pickupEnd = "El fin debe ser posterior al inicio.";
  }
  const hasImage =
    draft.imageFile != null ||
    (draft.existingImageUrl != null && draft.existingImageUrl.length > 0);
  if (!hasImage) {
    e.image = isEdit
      ? "Falta la imagen del producto."
      : "Sube una imagen (JPG o PNG, máx. 5 MB).";
  }
  return e;
}

export function PartnerProductFormModal({
  open,
  onClose,
  editingProductId,
  categoryApiIdHint,
  onSaved,
  scopedPartnerId,
}: PartnerProductFormModalProps) {
  const formId = useId();
  const [draft, setDraft] = useState<FormDraft>(() => defaultForm());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isEdit = editingProductId != null && editingProductId.length > 0;

  const pickedImageObjectUrl = useMemo(
    () => (draft.imageFile ? URL.createObjectURL(draft.imageFile) : null),
    [draft.imageFile]
  );

  useEffect(() => {
    return () => {
      if (pickedImageObjectUrl) URL.revokeObjectURL(pickedImageObjectUrl);
    };
  }, [pickedImageObjectUrl]);

  const reset = useCallback(() => {
    setDraft(defaultForm());
    setLoadError(null);
    setSubmitError(null);
    setFieldErrors({});
    setSubmitAttempted(false);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    if (!editingProductId) {
      reset();
      setLoadingEdit(false);
      setLoadError(null);
      return;
    }
    const ac = new AbortController();
    setLoadingEdit(true);
    setLoadError(null);
    void fetchProductForEdit(editingProductId, categoryApiIdHint, ac.signal, scopedPartnerId)
      .then((p) => {
        setDraft({
          ...p,
          imageFile: null,
          availableDayNums:
            p.availableDayNums.length > 0 ? p.availableDayNums : [1, 2, 3, 4, 5, 6, 7],
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(err instanceof Error ? err.message : "No se pudo cargar el producto.");
      })
      .finally(() => setLoadingEdit(false));
    return () => ac.abort();
  }, [open, editingProductId, categoryApiIdHint, scopedPartnerId, reset]);

  function toggleDay(n: number): void {
    setDraft((d) => {
      const set = new Set(d.availableDayNums);
      if (set.has(n)) set.delete(n);
      else set.add(n);
      const next = [...set].sort((a, b) => a - b);
      return { ...d, availableDayNums: next };
    });
  }

  function onPickImage(file: File | null): void {
    setSubmitError(null);
    if (!file) {
      setDraft((d) => ({ ...d, imageFile: null }));
      return;
    }
    const mimeOk =
      /^image\/(jpeg|png)$/i.test(file.type) ||
      (file.type === "" && /\.(jpe?g|png)$/i.test(file.name));
    if (!mimeOk) {
      setFieldErrors((fe) => ({ ...fe, image: "Solo JPG o PNG." }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFieldErrors((fe) => ({ ...fe, image: "Máximo 5 MB." }));
      return;
    }
    setFieldErrors((fe) => {
      const { image: _, ...rest } = fe;
      return rest;
    });
    setDraft((d) => ({ ...d, imageFile: file }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitAttempted(true);
    const errs = validate(draft, isEdit);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const catId = categoryApiIdFromDraftId(draft.categoryDraftId);
    if (catId == null) {
      setFieldErrors({ category: "Elige una categoría de la lista." });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name: draft.name,
        originalPrice: draft.originalPrice!,
        offerPrice: draft.offerPrice!,
        pickupStart: draft.pickupStart,
        pickupEnd: draft.pickupEnd,
        stock: draft.stock,
        categoryApiId: catId,
        availableDaysJson: encodeAvailableDaysForApi(draft.availableDayNums),
        description: draft.description,
        imageFile: draft.imageFile,
        existingImageUrl: draft.existingImageUrl,
      };
      if (isEdit && editingProductId) {
        await updatePartnerProduct(editingProductId, payload, undefined, scopedPartnerId);
      } else {
        await createPartnerProduct(payload, undefined, scopedPartnerId);
      }
      onSaved();
      onClose();
      reset();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const title = isEdit ? "Editar producto" : "Nuevo producto";
  const thumbSrc = pickedImageObjectUrl ?? draft.existingImageUrl?.trim() ?? "";
  const showImageFilled = thumbSrc.length > 0;
  const imageMetaName =
    draft.imageFile?.name ??
    (draft.existingImageUrl ? fileNameHintFromUrl(draft.existingImageUrl) : "");
  const imageMetaSize = draft.imageFile ? formatFileSize(draft.imageFile.size) : "";

  return (
    <div
      className="pp-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${formId}-title`}
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div className="pp-modal-card">
        <div className="pp-modal-head">
          <div className="pp-modal-head-text">
            <h2 id={`${formId}-title`}>{title}</h2>
            <p className="pp-modal-subtitle">
              {isEdit
                ? "Actualiza la información de tu producto en el catálogo."
                : "Agrega una bolsa sorpresa a tu catálogo"}
            </p>
          </div>
          <button
            type="button"
            className="pp-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form className="pp-modal-body" noValidate onSubmit={(e) => void handleSubmit(e)}>
          <div className="pp-banner-warn" role="status">
            <span className="pp-banner-warn-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </span>
            <span>
              Pasados los 30 días, el producto sin consumo ni edición se eliminará automáticamente.
            </span>
          </div>

          {loadError ? <div className="pp-msg pp-msg--err">{loadError}</div> : null}
          {submitError ? <div className="pp-msg pp-msg--err">{submitError}</div> : null}

          {loadingEdit ? (
            <p className="pp-msg pp-msg--info">Cargando datos…</p>
          ) : (
            <>
              <div className="pp-toggle-row">
                <div className="pp-toggle-copy">
                  <span className="pp-toggle-title">Solo disponible al cierre</span>
                  <span className="pp-toggle-desc">Aparece en el catálogo al final del día</span>
                </div>
                <button
                  type="button"
                  className={
                    draft.onlyAtClosing
                      ? "pp-switch pp-switch-green pp-switch--on"
                      : "pp-switch pp-switch-green"
                  }
                  onClick={() => setDraft((d) => ({ ...d, onlyAtClosing: !d.onlyAtClosing }))}
                  aria-pressed={draft.onlyAtClosing}
                  aria-label="Solo disponible al cierre"
                />
              </div>

              <div className="pp-field">
                <span className="pp-label-row">Imagen del producto *</span>
                <label
                  className={`pp-dropzone ${showImageFilled ? "pp-dropzone--filled" : ""}`}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
                  />
                  {showImageFilled ? (
                    <div className="pp-dropzone-filled-inner">
                      <img src={thumbSrc} alt="" className="pp-dropzone-thumb" />
                      <div className="pp-dropzone-meta">
                        <strong>{imageMetaName}</strong>
                        {imageMetaSize ? (
                          <span className="pp-dropzone-meta-size">{imageMetaSize}</span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="pp-dropzone-empty">
                      <svg
                        className="pp-dropzone-camera-svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <span className="pp-dropzone-title">Toca para agregar imagen</span>
                      <span className="pp-dropzone-hint">JPG, PNG — máx. 5 MB</span>
                    </div>
                  )}
                </label>
                {submitAttempted || fieldErrors.image ? (
                  <span className="pp-field-msg">{fieldErrors.image}</span>
                ) : null}
              </div>

              <div className="pp-row-name-stock">
                <div className={`pp-field ${fieldErrors.name ? "pp-field--err" : ""}`}>
                  <label htmlFor={`${formId}-name`}>Nombre del producto *</label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    autoComplete="off"
                    placeholder="Ej: Happy Bag Super"
                  />
                  {submitAttempted && fieldErrors.name ? (
                    <span className="pp-field-msg">{fieldErrors.name}</span>
                  ) : null}
                </div>

                <div className={`pp-field pp-field-stock-col ${fieldErrors.stock ? "pp-field--err" : ""}`}>
                  <span className="pp-label-row">Stock disponible *</span>
                  <div className="pp-stock-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, stock: Math.max(1, d.stock - 1) }))
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={draft.stock}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          stock: Math.max(1, parseInt(e.target.value, 10) || 1),
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setDraft((d) => ({ ...d, stock: d.stock + 1 }))}
                    >
                      +
                    </button>
                  </div>
                  {submitAttempted && fieldErrors.stock ? (
                    <span className="pp-field-msg">{fieldErrors.stock}</span>
                  ) : null}
                </div>
              </div>

              <div className="pp-row-pricing-pickup">
                <div className={`pp-field ${fieldErrors.originalPrice ? "pp-field--err" : ""}`}>
                  <label htmlFor={`${formId}-po`}>Precio original (S/) *</label>
                  <input
                    id={`${formId}-po`}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={draft.originalPrice ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        originalPrice: e.target.value === "" ? null : parseFloat(e.target.value),
                      }))
                    }
                  />
                  {submitAttempted && fieldErrors.originalPrice ? (
                    <span className="pp-field-msg">{fieldErrors.originalPrice}</span>
                  ) : null}
                </div>
                <div className={`pp-field ${fieldErrors.offerPrice ? "pp-field--err" : ""}`}>
                  <label htmlFor={`${formId}-of`}>Precio oferta (S/) *</label>
                  <input
                    id={`${formId}-of`}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={draft.offerPrice ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        offerPrice: e.target.value === "" ? null : parseFloat(e.target.value),
                      }))
                    }
                  />
                  {submitAttempted && fieldErrors.offerPrice ? (
                    <span className="pp-field-msg">{fieldErrors.offerPrice}</span>
                  ) : null}
                </div>
                <div className={`pp-field ${fieldErrors.pickupStart ? "pp-field--err" : ""}`}>
                  <label htmlFor={`${formId}-ps`}>Inicio de recojo *</label>
                  <input
                    id={`${formId}-ps`}
                    type="time"
                    value={draft.pickupStart}
                    onChange={(e) => setDraft((d) => ({ ...d, pickupStart: e.target.value }))}
                  />
                  {submitAttempted && fieldErrors.pickupStart ? (
                    <span className="pp-field-msg">{fieldErrors.pickupStart}</span>
                  ) : null}
                </div>
                <div className={`pp-field ${fieldErrors.pickupEnd ? "pp-field--err" : ""}`}>
                  <label htmlFor={`${formId}-pe`}>Fin de recojo *</label>
                  <input
                    id={`${formId}-pe`}
                    type="time"
                    value={draft.pickupEnd}
                    onChange={(e) => setDraft((d) => ({ ...d, pickupEnd: e.target.value }))}
                  />
                  {submitAttempted && fieldErrors.pickupEnd ? (
                    <span className="pp-field-msg">{fieldErrors.pickupEnd}</span>
                  ) : null}
                </div>
              </div>

              <fieldset
                className={`pp-field pp-category-field ${fieldErrors.category ? "pp-field--err" : ""}`}
              >
                <legend className="pp-label-row">Categoría *</legend>
                <div className="pp-category-chip-grid">
                  {PARTNER_PRODUCT_CATEGORIES.map((c) => {
                    const on = draft.categoryDraftId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={
                          on ? "pp-category-chip pp-category-chip--on" : "pp-category-chip"
                        }
                        onClick={() =>
                          setDraft((d) => ({ ...d, categoryDraftId: c.id }))
                        }
                        aria-pressed={on}
                      >
                        <span className="pp-category-chip-emoji" aria-hidden>
                          {c.emoji}
                        </span>
                        <span className="pp-category-chip-label">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
                {submitAttempted && fieldErrors.category ? (
                  <span className="pp-field-msg">{fieldErrors.category}</span>
                ) : null}
              </fieldset>

              <div className={`pp-field ${fieldErrors.days ? "pp-field--err" : ""}`}>
                <span className="pp-label-row">Días disponibles *</span>
                <div className="pp-days-row" role="group" aria-label="Días de la semana">
                  {DAY_LABELS.map((lbl, i) => {
                    const n = i + 1;
                    const on = draft.availableDayNums.includes(n);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        className={on ? "pp-day-chip pp-day-chip--on" : "pp-day-chip"}
                        onClick={() => toggleDay(n)}
                        aria-pressed={on}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
                {submitAttempted && fieldErrors.days ? (
                  <span className="pp-field-msg">{fieldErrors.days}</span>
                ) : null}
              </div>

              <div className="pp-field">
                <label htmlFor={`${formId}-desc`}>Descripción</label>
                <textarea
                  id={`${formId}-desc`}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Ingrese descripción del producto"
                />
              </div>

              <div className="pp-modal-foot">
                <button type="button" className="pp-btn-ghost" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="pp-btn-primary" disabled={submitting || loadingEdit}>
                  {submitting ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
