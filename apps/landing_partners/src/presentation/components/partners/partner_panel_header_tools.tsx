import { NotificationsPopover } from "@/presentation/components/common/notifications_popover";
import { PeriodFilterPopover } from "@/presentation/components/common/period_filter_popover";
import type { PeriodFilterPresetId } from "@/presentation/utils/period_filter_utils";
import type { DateRange } from "@/presentation/utils/date_range_utils";

export type PartnerPanelHeaderToolsProps = {
  allowCustom?: boolean;
  /** Perfil y otras vistas sin rango de fechas del dashboard. */
  showPeriodFilter?: boolean;
  presetId?: PeriodFilterPresetId;
  onPresetChange?: (id: PeriodFilterPresetId) => void;
  customRange?: DateRange;
  onCustomRangeChange?: (range: DateRange) => void;
};

export function PartnerPanelHeaderTools({
  allowCustom = true,
  showPeriodFilter = true,
  presetId = "today",
  onPresetChange,
  customRange = { from: "", to: "" },
  onCustomRangeChange,
}: PartnerPanelHeaderToolsProps) {
  return (
    <>
      {showPeriodFilter && onPresetChange && onCustomRangeChange ? (
        <PeriodFilterPopover
          allowCustom={allowCustom}
          value={presetId}
          onChange={onPresetChange}
          customRange={customRange}
          onCustomRangeChange={onCustomRangeChange}
        />
      ) : null}
      <NotificationsPopover />
    </>
  );
}
