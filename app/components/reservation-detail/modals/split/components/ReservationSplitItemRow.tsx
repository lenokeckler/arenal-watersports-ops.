import type { JSX } from "react";
import {
  INPUT_TYPES,
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_NUMBERS,
} from "@/app/constants";
import type { SplitItemState } from "../hooks/useReservationSplitModalViewModel";

const NO_MOVE = 0;
const WHOLE_UNIT = 1;

interface ReservationSplitItemRowProps {
  isBusy: boolean;
  item: SplitItemState;
  onMovingQuantityChange: (
    itemId: string,
    movingQuantity: number
  ) => void;
}

/**
 * US-RES-019: one equipment line — a unit toggles whole (checkbox), a
 * quantity line moves a partial count to the new salida.
 */
const ReservationSplitItemRow = ({
  isBusy,
  item,
  onMovingQuantityChange,
}: ReservationSplitItemRowProps): JSX.Element => (
  <div className="flex items-center justify-between gap-sm rounded-lg border border-white/10 bg-surface-container-low px-sm py-sm">
    <span className="font-body-base text-body-base text-on-surface">
      {item.label}
    </span>
    {item.unitId ? (
      <button
        type="button"
        disabled={isBusy}
        onClick={() =>
          onMovingQuantityChange(
            item.itemId,
            item.movingQuantity === WHOLE_UNIT
              ? NO_MOVE
              : WHOLE_UNIT
          )
        }
        className={`rounded-full border px-sm py-1 font-label-mono text-label-mono transition-colors disabled:opacity-50 ${
          item.movingQuantity === WHOLE_UNIT
            ? "border-primary bg-primary/20 text-primary"
            : "border-white/10 text-on-surface-variant hover:border-primary/40"
        }`}
      >
        {RESERVATION_DETAIL_SCREEN.SPLIT.MOVE_ALL}
      </button>
    ) : (
      <input
        type={INPUT_TYPES.NUMBER}
        min={RESERVATION_NUMBERS.MIN_QUANTITY}
        max={item.maxQuantity}
        value={item.movingQuantity}
        disabled={isBusy}
        onChange={(event) =>
          onMovingQuantityChange(
            item.itemId,
            Number(event.target.value)
          )
        }
        className="!w-20 rounded-lg border border-white/10 bg-surface-container-low p-sm text-right text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    )}
  </div>
);

export default ReservationSplitItemRow;
