import type { JSX } from "react";
import {
  INPUT_TYPES,
  NEW_RESERVATION_SCREEN,
  RESERVATION_NUMBERS,
} from "@/app/constants";
import type { ReservableCategory } from "@/app/utils/reservas/newReservationData";
import type { CategoryAvailability } from "@/app/utils/reservas/availabilityQueries";
import { FIELD_CLASS } from "../reservationFormStyles";

interface ReservationFormQuantityCategoryProps {
  availability: CategoryAvailability | undefined;
  category: ReservableCategory;
  isBusy: boolean;
  onQuantityChange: (
    categoryId: string,
    quantity: number
  ) => void;
  quantity: number;
}

/**
 * US-RES-007/US-RES-015/US-RES-016: how many units of a by-quantity
 * category (kayaks, life vests) this reservation takes — with the live
 * free count and a soft warning when the request outgrows it.
 */
const ReservationFormQuantityCategory = ({
  availability,
  category,
  isBusy,
  onQuantityChange,
  quantity,
}: ReservationFormQuantityCategoryProps): JSX.Element => {
  const isOverCapacity =
    Boolean(availability) &&
    quantity > (availability?.free ?? 0);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container-low px-sm py-sm">
      <div className="flex items-center justify-between gap-sm">
        <span className="font-body-base text-body-base text-on-surface">
          {category.name}
        </span>
        <input
          type={INPUT_TYPES.NUMBER}
          min={RESERVATION_NUMBERS.MIN_QUANTITY}
          value={quantity}
          disabled={isBusy}
          onChange={(event) =>
            onQuantityChange(
              category.id,
              Number(event.target.value)
            )
          }
          className={`${FIELD_CLASS} !w-20 text-right`}
        />
      </div>
      {availability && (
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {NEW_RESERVATION_SCREEN.EQUIPMENT.FREE_OF_TOTAL(
            availability.free,
            availability.usable
          )}
        </span>
      )}
      {isOverCapacity && (
        <span className="font-label-mono text-label-mono text-error">
          {NEW_RESERVATION_SCREEN.EQUIPMENT.WARNING.OVER_CAPACITY(
            quantity,
            availability?.free ?? 0
          )}
        </span>
      )}
    </div>
  );
};

export default ReservationFormQuantityCategory;
