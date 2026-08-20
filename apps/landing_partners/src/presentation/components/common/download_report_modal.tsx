import { DateRangePicker } from "@/presentation/components/common/date_range_picker";
import {
  defaultDateRange,
  type DateRange,
} from "@/presentation/utils/date_range_utils";
import { useEffect, useState } from "react";
import "@/presentation/styles/download_report_modal.css";

export type DownloadReportOptions = {
  period: DateRange;
  includeSalesTotals: boolean;
  includeOrderDetail: boolean;
};

export type DownloadReportModalProps = {
  open: boolean;
  onClose: () => void;
};

export function DownloadReportModal({ open, onClose }: DownloadReportModalProps) {
  const [period, setPeriod] = useState<DateRange>(defaultDateRange);
  const [includeSalesTotals, setIncludeSalesTotals] = useState(true);
  const [includeOrderDetail, setIncludeOrderDetail] = useState(true);

  useEffect(() => {
    if (!open) return;
    setPeriod(defaultDateRange());
    setIncludeSalesTotals(true);
    setIncludeOrderDetail(true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="hb-download-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="hb-download-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hb-download-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="hb-download-modal-head">
          <h2 id="hb-download-modal-title">Descargar reporte</h2>
          <p className="hb-download-modal-sub">Configura qué datos incluir en tu reporte.</p>
          <button
            type="button"
            className="hb-download-modal-close"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="hb-download-modal-body">
          <DateRangePicker
            id="download-report-period"
            label="Periodo"
            value={period}
            onChange={setPeriod}
          />

          <div>
            <p className="hb-download-modal-section-title">Stock disponible</p>
            <div className="hb-download-modal-checks">
              <label className="hb-download-modal-check">
                <input
                  type="checkbox"
                  checked={includeSalesTotals}
                  onChange={(e) => setIncludeSalesTotals(e.target.checked)}
                />
                Ventas y totales
              </label>
              <label className="hb-download-modal-check">
                <input
                  type="checkbox"
                  checked={includeOrderDetail}
                  onChange={(e) => setIncludeOrderDetail(e.target.checked)}
                />
                Detalle de órdenes
              </label>
            </div>
          </div>
        </div>

        <footer className="hb-download-modal-foot">
          <button type="button" className="hb-download-modal-btn hb-download-modal-btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hb-download-modal-btn hb-download-modal-btn--solid" onClick={onClose}>
            Descargar
          </button>
        </footer>
      </div>
    </div>
  );
}
