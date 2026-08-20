import type { MetricsRangeId } from "@happy-bags/partner-dashboard";
import {
  formatRangeDisplay,
  type DateRange,
} from "@/presentation/utils/date_range_utils";

export type PeriodFilterPresetId = MetricsRangeId;

export const PERIOD_FILTER_PRESET_IDS: PeriodFilterPresetId[] = [
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "custom",
];

export const PERIOD_FILTER_PRESET_IDS_NO_CUSTOM: PeriodFilterPresetId[] =
  PERIOD_FILTER_PRESET_IDS.filter((id) => id !== "custom");

function formatShortDate(iso: string): string {
  if (!iso.trim()) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

export function getPeriodFilterTriggerLabel(
  presetId: PeriodFilterPresetId,
  customRange: DateRange,
  labels: Record<PeriodFilterPresetId, string>
): string {
  if (presetId === "custom" && customRange.from && customRange.to) {
    const short = `${formatShortDate(customRange.from)} – ${formatShortDate(customRange.to)}`;
    if (short.length <= 28) return short;
    return formatRangeDisplay(customRange.from, customRange.to);
  }
  return labels[presetId];
}
