import type { MetricsRangeId } from "@happy-bags/partner-dashboard";
import { parsePartnerApiNumericId } from "@/domain/utils/partner_api_id";
import {
  getPresetRange,
  normalizeRange,
  type DateRange,
} from "@/presentation/utils/date_range_utils";

export type DashboardDateQuery = {
  dateFrom: string;
  dateTo: string;
};

/** Convierte el preset del selector (por defecto «Hoy») a `date_from` / `date_to` del API. */
export function resolveDashboardDateQuery(
  presetId: MetricsRangeId,
  customRange: DateRange
): DashboardDateQuery {
  if (presetId === "custom") {
    const normalized = normalizeRange(customRange.from, customRange.to);
    if (normalized.from && normalized.to) {
      return { dateFrom: normalized.from, dateTo: normalized.to };
    }
  }
  const preset = getPresetRange(presetId);
  if (preset?.from && preset?.to) {
    return { dateFrom: preset.from, dateTo: preset.to };
  }
  const today = getPresetRange("today")!;
  return { dateFrom: today.from, dateTo: today.to };
}

export function resolvePartnerIdQuery(partnerId: string | undefined): number | null {
  return parsePartnerApiNumericId(partnerId);
}
