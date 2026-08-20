import { METRICS_RANGE_LABELS, type MetricsRangeId } from "@happy-bags/partner-dashboard";
import {
  getPeriodFilterTriggerLabel,
  type PeriodFilterPresetId,
} from "@/presentation/utils/period_filter_utils";
import type { DateRange } from "@/presentation/utils/date_range_utils";
import { useCallback, useMemo, useState } from "react";

export function usePeriodFilter(initialPreset: PeriodFilterPresetId = "today") {
  const [presetId, setPresetId] = useState<PeriodFilterPresetId>(initialPreset);
  const [customRange, setCustomRange] = useState<DateRange>({ from: "", to: "" });

  const triggerLabel = useMemo(
    () => getPeriodFilterTriggerLabel(presetId, customRange, METRICS_RANGE_LABELS),
    [presetId, customRange]
  );

  const setCustomRangeFromTo = useCallback((from: string, to: string) => {
    setCustomRange({ from, to });
  }, []);

  const metricsRangeId: MetricsRangeId = presetId;

  const metricsCustomRange =
    presetId === "custom" && customRange.from && customRange.to
      ? customRange
      : undefined;

  return {
    presetId,
    setPresetId,
    customRange,
    setCustomRange,
    setCustomRangeFromTo,
    triggerLabel,
    metricsRangeId,
    metricsCustomRange,
  };
}
