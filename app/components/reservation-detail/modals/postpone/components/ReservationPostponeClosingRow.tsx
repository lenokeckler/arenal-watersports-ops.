import type { JSX } from "react";
import {
  INPUT_TYPES,
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_NUMBERS,
  USAGE_METRIC_LABEL,
} from "@/app/constants";
import type { ClosingFieldState } from "../hooks/useReservationPostponeModalViewModel";

interface ReservationPostponeClosingRowProps {
  closing: ClosingFieldState;
  isBusy: boolean;
  onFuelChange: (itemId: string, value: string) => void;
  onUsageChange: (itemId: string, value: string) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** US-RES-020: the fuel/usage reading a single dispatched unit closes with. */
const ReservationPostponeClosingRow = ({
  closing,
  isBusy,
  onFuelChange,
  onUsageChange,
}: ReservationPostponeClosingRowProps): JSX.Element => (
  <div className="flex flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
    <span className="font-body-base text-body-base text-on-surface">
      {closing.unitCode}
    </span>
    <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
      {closing.showFuel && (
        <label className="flex flex-col gap-1">
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {
              RESERVATION_DETAIL_SCREEN.POSTPONE
                .CLOSING_FUEL_LABEL
            }
          </span>
          <input
            type={INPUT_TYPES.NUMBER}
            min={RESERVATION_NUMBERS.FUEL_PERCENT_MIN}
            max={RESERVATION_NUMBERS.FUEL_PERCENT_MAX}
            value={closing.fuelPercent}
            disabled={isBusy}
            onChange={(event) =>
              onFuelChange(closing.itemId, event.target.value)
            }
            className={INPUT_CLASS}
          />
        </label>
      )}
      {closing.showUsage && (
        <label className="flex flex-col gap-1">
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {closing.usageMetric
              ? USAGE_METRIC_LABEL[closing.usageMetric]
              : RESERVATION_DETAIL_SCREEN.POSTPONE
                  .CLOSING_USAGE_LABEL}
          </span>
          <input
            type={INPUT_TYPES.NUMBER}
            min={RESERVATION_NUMBERS.MIN_QUANTITY}
            value={closing.usageReading}
            disabled={isBusy}
            onChange={(event) =>
              onUsageChange(
                closing.itemId,
                event.target.value
              )
            }
            className={INPUT_CLASS}
          />
        </label>
      )}
    </div>
  </div>
);

export default ReservationPostponeClosingRow;
