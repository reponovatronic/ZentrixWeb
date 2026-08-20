import type { MetricsRangeId } from "@happy-bags/partner-dashboard";
import { create } from "zustand";
import type { DateRange } from "@/presentation/utils/date_range_utils";

type PartnerDashboardFiltersState = {
  presetId: MetricsRangeId;
  customRange: DateRange;
};

type PartnerDashboardFiltersActions = {
  setPresetId: (id: MetricsRangeId) => void;
  setCustomRange: (range: DateRange) => void;
  resetToToday: () => void;
};

const initial: PartnerDashboardFiltersState = {
  presetId: "today",
  customRange: { from: "", to: "" },
};

export const usePartnerDashboardFiltersStore = create<
  PartnerDashboardFiltersState & PartnerDashboardFiltersActions
>((set) => ({
  ...initial,
  setPresetId: (presetId) => set({ presetId }),
  setCustomRange: (customRange) => set({ customRange }),
  resetToToday: () => set(initial),
}));
