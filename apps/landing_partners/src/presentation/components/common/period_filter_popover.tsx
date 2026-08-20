import { DateRangePicker } from "@/presentation/components/common/date_range_picker";
import { METRICS_RANGE_LABELS } from "@happy-bags/partner-dashboard";
import {
  getPeriodFilterTriggerLabel,
  PERIOD_FILTER_PRESET_IDS,
  PERIOD_FILTER_PRESET_IDS_NO_CUSTOM,
  type PeriodFilterPresetId,
} from "@/presentation/utils/period_filter_utils";
import type { DateRange } from "@/presentation/utils/date_range_utils";
import { defaultDateRange } from "@/presentation/utils/date_range_utils";
import { useEffect, useId, useRef, useState } from "react";

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

export type PeriodFilterPopoverProps = {
  value: PeriodFilterPresetId;
  onChange: (next: PeriodFilterPresetId) => void;
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
  /** En dashboard no se ofrece rango personalizado (demasiadas fechas). */
  allowCustom?: boolean;
};

export function PeriodFilterPopover({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
  allowCustom = true,
}: PeriodFilterPopoverProps) {
  const uid = useId().replace(/:/g, "");
  const panelId = `pd-period-filter-${uid}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftCustom, setDraftCustom] = useState<DateRange>(customRange);

  const presetIds = allowCustom
    ? PERIOD_FILTER_PRESET_IDS
    : PERIOD_FILTER_PRESET_IDS_NO_CUSTOM;

  const triggerLabel = getPeriodFilterTriggerLabel(value, customRange, METRICS_RANGE_LABELS);

  useEffect(() => {
    if (open) {
      setDraftCustom(
        customRange.from && customRange.to ? customRange : defaultDateRange()
      );
    }
  }, [open, customRange]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function selectChip(id: PeriodFilterPresetId) {
    onChange(id);
    if (id !== "custom") setOpen(false);
  }

  function applyCustomRange(range: DateRange) {
    if (!range.from || !range.to) return;
    onCustomRangeChange(range);
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
            {presetIds.map((id) => (
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

          {allowCustom && value === "custom" ? (
            <div className="pd-metrics-filter-custom pd-metrics-filter-custom--picker">
              <DateRangePicker
                mode="embedded"
                value={draftCustom}
                onChange={setDraftCustom}
                onApply={applyCustomRange}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
