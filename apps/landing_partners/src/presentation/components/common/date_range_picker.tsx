import {
  DATE_RANGE_PRESET_LABELS,
  type DateRange,
  type DateRangePresetId,
  daysInMonth,
  formatRangeDisplay,
  getPresetRange,
  isDateInRange,
  normalizeRange,
  parseIsoDate,
  toIsoDateLocal,
} from "@/presentation/utils/date_range_utils";
import { useEffect, useId, useRef, useState } from "react";
import "@/presentation/styles/date_range_picker.css";

const PRESET_IDS: DateRangePresetId[] = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_7_days",
  "custom",
];

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

function IconCalendar() {
  return (
    <svg className="hb-drp-trigger-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

type CalendarProps = {
  viewYear: number;
  viewMonth: number;
  from: string;
  to: string;
  onPick: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

function RangeCalendar({
  viewYear,
  viewMonth,
  from,
  to,
  onPick,
  onPrevMonth,
  onNextMonth,
}: CalendarProps) {
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const offset = firstDow === 0 ? 6 : firstDow - 1;
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];

  const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevTotal = daysInMonth(prevYear, prevMonth);

  for (let i = offset - 1; i >= 0; i--) {
    const day = prevTotal - i;
    const d = new Date(prevYear, prevMonth, day);
    cells.push({ iso: toIsoDateLocal(d), day, inMonth: false });
  }
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(viewYear, viewMonth, day);
    cells.push({ iso: toIsoDateLocal(d), day, inMonth: true });
  }
  const rest = 42 - cells.length;
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  for (let day = 1; day <= rest; day++) {
    const d = new Date(nextYear, nextMonth, day);
    cells.push({ iso: toIsoDateLocal(d), day, inMonth: false });
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="hb-drp-cal">
      <div className="hb-drp-cal-head">
        <span className="hb-drp-cal-title">{monthLabel}</span>
        <div className="hb-drp-cal-nav">
          <button type="button" onClick={onPrevMonth} aria-label="Mes anterior">
            ‹
          </button>
          <button type="button" onClick={onNextMonth} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </div>
      <div className="hb-drp-cal-grid" role="grid" aria-label="Calendario">
        {WEEKDAYS.map((d) => (
          <span key={d} className="hb-drp-cal-dow" role="columnheader">
            {d}
          </span>
        ))}
        {cells.map((cell) => {
          const inRange = from && to && isDateInRange(cell.iso, from, to);
          const isEdge = cell.iso === from || cell.iso === to;
          let cls = "hb-drp-cal-day";
          if (!cell.inMonth) cls += " hb-drp-cal-day--muted";
          if (inRange && !isEdge) cls += " hb-drp-cal-day--in-range";
          if (isEdge) cls += " hb-drp-cal-day--edge";
          return (
            <button
              key={`${cell.iso}-${cell.inMonth}`}
              type="button"
              className={cls}
              onClick={() => onPick(cell.iso)}
              disabled={!cell.inMonth}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type DateRangePickerProps = {
  id?: string;
  label?: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  /** Si es false, los presets aplican al instante sin botón Aplicar. */
  showApplyButton?: boolean;
  /** Dentro del popover «Filtro» (personalizado): sin trigger, panel siempre visible. */
  mode?: "default" | "embedded";
  /** Solo en `embedded`: al pulsar Aplicar periodo. */
  onApply?: (value: DateRange) => void;
};

export function DateRangePicker({
  id: idProp,
  label = "Periodo",
  value,
  onChange,
  showApplyButton = true,
  mode = "default",
  onApply,
}: DateRangePickerProps) {
  const embedded = mode === "embedded";
  const uid = useId().replace(/:/g, "");
  const triggerId = idProp ?? `hb-drp-${uid}`;
  const panelId = `hb-drp-panel-${uid}`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(embedded);
  const [draft, setDraft] = useState<DateRange>(value);
  const [activePreset, setActivePreset] = useState<DateRangePresetId>("this_week");
  const [pickPhase, setPickPhase] = useState<"start" | "end">("start");

  const anchor = parseIsoDate(value.from) ?? new Date();
  const [viewYear, setViewYear] = useState(anchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchor.getMonth());

  useEffect(() => {
    setDraft(value);
    const d = parseIsoDate(value.from) ?? new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setPickPhase("start");
  }, [value]);

  useEffect(() => {
    if (embedded || !open) return;
    setDraft(value);
    const d = parseIsoDate(value.from) ?? new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setPickPhase("start");
  }, [open, value, embedded]);

  useEffect(() => {
    if (embedded || !open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, embedded]);

  function commit(next: DateRange, preset: DateRangePresetId) {
    const normalized = normalizeRange(next.from, next.to);
    setDraft(normalized);
    onChange(normalized);
    setActivePreset(preset);
    if (embedded && onApply) {
      onApply(normalized);
      return;
    }
    if (preset !== "custom" || !showApplyButton) setOpen(false);
  }

  function selectPreset(preset: DateRangePresetId) {
    if (preset === "custom") {
      setActivePreset("custom");
      return;
    }
    const range = getPresetRange(preset);
    if (range) commit(range, preset);
  }

  function applyCustom() {
    if (!draft.from || !draft.to) return;
    const normalized = normalizeRange(draft.from, draft.to);
    if (embedded && onApply) {
      onChange(normalized);
      onApply(normalized);
      return;
    }
    commit(normalized, "custom");
    setOpen(false);
  }

  const panelVisible = embedded || open;

  function onCalendarPick(iso: string) {
    setActivePreset("custom");
    if (pickPhase === "start" || !draft.from) {
      setDraft({ from: iso, to: "" });
      setPickPhase("end");
      return;
    }
    const normalized = normalizeRange(draft.from, iso);
    setDraft(normalized);
    setPickPhase("start");
    if (!showApplyButton) {
      commit(normalized, "custom");
    }
  }

  function onInputChange(part: "from" | "to", iso: string) {
    setActivePreset("custom");
    const next = { ...draft, [part]: iso };
    if (next.from && next.to) {
      const normalized = normalizeRange(next.from, next.to);
      setDraft(normalized);
      if (!showApplyButton) commit(normalized, "custom");
    } else {
      setDraft(next);
    }
  }

  return (
    <div
      className={embedded ? "hb-drp-wrap hb-drp-wrap--embedded" : "hb-drp-wrap"}
      ref={wrapRef}
    >
      {!embedded && label ? (
        <label className="hb-drp-label" htmlFor={triggerId}>
          {label}
        </label>
      ) : null}
      {!embedded ? (
        <button
          type="button"
          id={triggerId}
          className="hb-drp-trigger"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="hb-drp-trigger-text">{formatRangeDisplay(value.from, value.to)}</span>
          <IconCalendar />
        </button>
      ) : null}

      {panelVisible ? (
        <div
          id={panelId}
          className={embedded ? "hb-drp-panel hb-drp-panel--embedded" : "hb-drp-panel"}
          role="dialog"
          aria-label="Selector de periodo"
        >
          <div className="hb-drp-presets">
            {PRESET_IDS.map((pid) => (
              <button
                key={pid}
                type="button"
                className={
                  activePreset === pid ? "hb-drp-preset hb-drp-preset--on" : "hb-drp-preset"
                }
                onClick={() => selectPreset(pid)}
              >
                {DATE_RANGE_PRESET_LABELS[pid]}
              </button>
            ))}
          </div>

          <div className="hb-drp-inputs">
            <label className="hb-drp-field">
              <span>Desde</span>
              <input
                type="date"
                value={draft.from}
                onChange={(e) => onInputChange("from", e.target.value)}
              />
            </label>
            <label className="hb-drp-field">
              <span>Hasta</span>
              <input
                type="date"
                value={draft.to}
                onChange={(e) => onInputChange("to", e.target.value)}
              />
            </label>
          </div>

          <RangeCalendar
            viewYear={viewYear}
            viewMonth={viewMonth}
            from={draft.from}
            to={draft.to}
            onPick={onCalendarPick}
            onPrevMonth={() => {
              if (viewMonth === 0) {
                setViewYear((y) => y - 1);
                setViewMonth(11);
              } else {
                setViewMonth((m) => m - 1);
              }
            }}
            onNextMonth={() => {
              if (viewMonth === 11) {
                setViewYear((y) => y + 1);
                setViewMonth(0);
              } else {
                setViewMonth((m) => m + 1);
              }
            }}
          />

          <p className="hb-drp-hint">
            {pickPhase === "start"
              ? "Elige la fecha de inicio en el calendario o usa los campos de fecha."
              : "Elige la fecha de fin para completar el rango."}
          </p>

          {showApplyButton ? (
            <button
              type="button"
              className="hb-drp-apply"
              disabled={!draft.from || !draft.to}
              onClick={applyCustom}
            >
              Aplicar periodo
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
