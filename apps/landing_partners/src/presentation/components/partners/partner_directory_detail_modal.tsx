import type { PartnerDirectoryRow } from "@/domain/entities/partner_directory_row";
import { useEffect } from "react";
import "@/presentation/styles/partner_directory_detail_modal.css";

export type PartnerDirectoryDetailModalProps = {
  open: boolean;
  row: PartnerDirectoryRow | null;
  onClose: () => void;
};

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      return "pp-dir-detail-pill pp-dir-detail-pill--ok";
    case "pending":
      return "pp-dir-detail-pill pp-dir-detail-pill--warn";
    case "inactive":
      return "pp-dir-detail-pill pp-dir-detail-pill--muted";
  }
}

function strFromRaw(raw: Record<string, unknown> | undefined, ...keys: string[]): string {
  if (!raw) return "";
  for (const key of keys) {
    const v = raw[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

function formatCreatedAt(raw: Record<string, unknown> | undefined, fallbackLabel: string): string {
  const iso = strFromRaw(raw, "created_at", "createdAt");
  if (iso) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("es-PE", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return iso;
  }
  return fallbackLabel.trim() || "—";
}

type DetailField = { label: string; value: string };

function buildDetailFields(row: PartnerDirectoryRow): DetailField[] {
  const raw = row.listItemRaw;
  const address = strFromRaw(raw, "address", "direccion", "full_address");
  const owner = row.ownerName?.trim() || strFromRaw(raw, "owner_name", "ownerName");
  const phone = row.phone?.trim() || strFromRaw(raw, "phone", "telefono", "phone_number");

  return [
    { label: "ID de partner", value: row.id || "—" },

    { label: "Titular / contacto", value: owner || "—" },
    { label: "Correo electrónico", value: row.email || "—" },
    { label: "Teléfono", value: phone || "—" },
    { label: "Dirección", value: address || "—" },
    { label: "Estado", value: statusLabel(row.status) },
    { label: "Fecha de alta", value: formatCreatedAt(raw, row.joinedAtLabel) },
  ];
}

export function PartnerDirectoryDetailModal({
  open,
  row,
  onClose,
}: PartnerDirectoryDetailModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !row) return null;

  const fields = buildDetailFields(row);

  return (
    <div className="pp-dir-detail-root" role="presentation">
      <button
        type="button"
        className="pp-dir-detail-backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className="pp-dir-detail-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-dir-detail-title"
      >
        <header className="pp-dir-detail-head">
          <div className="pp-dir-detail-head-main">
            <span
              className="pp-dir-detail-avatar"
              style={{ background: row.avatarColor }}
              aria-hidden
            >
              {row.initial}
            </span>
            <div>
              <h2 id="pp-dir-detail-title">{row.businessName}</h2>
              <p className="pp-dir-detail-sub">
                Partner #{row.id}
                {row.email && row.email !== "—" ? ` · ${row.email}` : ""}
              </p>
            </div>
          </div>
          <button type="button" className="pp-dir-detail-close" onClick={onClose}>
            <IconClose />
          </button>
        </header>

        <div className="pp-dir-detail-status-row">
          <span className={statusPillClass(row.status)}>
            <span className="pp-dir-detail-pill-dot" aria-hidden />
            {statusLabel(row.status)}
          </span>
        </div>

        <dl className="pp-dir-detail-fields">
          {fields.map((f) => (
            <div key={f.label} className="pp-dir-detail-field">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>

        <footer className="pp-dir-detail-foot">
          <button type="button" className="pp-dir-detail-btn" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
