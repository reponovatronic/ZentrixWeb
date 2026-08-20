import { DownloadReportModal } from "@/presentation/components/common/download_report_modal";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type DownloadReportModalContextValue = {
  openDownloadReport: () => void;
};

const DownloadReportModalContext = createContext<DownloadReportModalContextValue | null>(
  null
);

export function DownloadReportModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openDownloadReport = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openDownloadReport }), [openDownloadReport]);

  return (
    <DownloadReportModalContext.Provider value={value}>
      {children}
      <DownloadReportModal open={open} onClose={close} />
    </DownloadReportModalContext.Provider>
  );
}

export function useDownloadReportModal(): DownloadReportModalContextValue {
  const ctx = useContext(DownloadReportModalContext);
  if (!ctx) {
    throw new Error("useDownloadReportModal debe usarse dentro de DownloadReportModalProvider");
  }
  return ctx;
}
