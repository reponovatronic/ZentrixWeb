import {
  type MetricsRangeId,
  METRICS_RANGE_LABELS,
} from "./metrics_mock_data";
import { useEffect, useId, useRef, useState } from "react";

const OPTIONS: MetricsRangeId[] = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "custom",
];

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export type PartnerMetricsRangeFilterProps = {
  value: MetricsRangeId;
  onChange: (next: MetricsRangeId) => void;
  customFrom: string;
  customTo: string;
  onCustomRangeCommit: (from: string, to: string) => void;
};

function formatShortDate(iso: string): string {
  if (!iso.trim()) return "";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

export function PartnerMetricsRangeFilter({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomRangeCommit,
}: PartnerMetricsRangeFilterProps) {
  const uid = useId().replace(/:/g, "");
  const panelId = `pd-metrics-filter-${uid}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);

  useEffect(() => {
    if (open) {
      setDraftFrom(customFrom);
      setDraftTo(customTo);
    }
  }, [open, customFrom, customTo]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const triggerLabel =
    value === "custom" && customFrom && customTo
      ? `${formatShortDate(customFrom)} – ${formatShortDate(customTo)}`
      : METRICS_RANGE_LABELS[value];

  function selectChip(id: MetricsRangeId) {
    onChange(id);
    if (id !== "custom") setOpen(false);
  }

  function applyCustom() {
    if (!draftFrom || !draftTo) return;
    if (draftFrom > draftTo) return;
    onCustomRangeCommit(draftFrom, draftTo);
    setOpen(false);
  }

  return (
    <div className="pd-metrics-filter-wrap" ref={wrapRef}>
      <button
        type="button"
        className="pd-select-like pd-metrics-filter-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <IconCalendar />
        <span className="pd-metrics-filter-trigger-label">{triggerLabel}</span>
        <span className="pd-metrics-filter-trigger-chevron" aria-hidden>
          <IconChevron />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="pd-metrics-filter-panel"
          role="dialog"
          aria-label="Filtro de fechas"
        >
          <div className="pd-metrics-filter-panel-title">Filtro</div>
          <div className="pd-metrics-filter-grid">
            {OPTIONS.map((id) => (
              <button
                key={id}
                type="button"
                className={
                  value === id
                    ? "pd-metrics-filter-chip pd-metrics-filter-chip--on"
                    : "pd-metrics-filter-chip"
                }
                onClick={() => selectChip(id)}
              >
                {METRICS_RANGE_LABELS[id]}
              </button>
            ))}
          </div>
          {value === "custom" ? (
            <div className="pd-metrics-filter-custom">
              <label className="pd-metrics-filter-field">
                <span>Desde</span>
                <input
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
              </label>
              <label className="pd-metrics-filter-field">
                <span>Hasta</span>
                <input
                  type="date"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="pd-metrics-filter-apply"
                disabled={!draftFrom || !draftTo || draftFrom > draftTo}
                onClick={applyCustom}
              >
                Aplicar
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
