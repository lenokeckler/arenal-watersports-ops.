import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
} from "@/app/constants";
import ActionSheet from "@/app/components/action-sheet/ActionSheet";
import Spinner from "@/app/components/spinner/Spinner";
import PendingDispatchCard from "@/app/components/pending-dispatch/components/PendingDispatchCard";
import type { OperationsReservationSummary } from "@/app/utils/operaciones/dispatchBoard";

const EMPTY_LENGTH = 0;

interface UnitDispatchReservationPickerProps {
  isLoading: boolean;
  onClose: () => void;
  onSelect: (reservationId: string) => void;
  reservations: OperationsReservationSummary[];
}

/**
 * US-OPE-002 (tablero entry): today's pending reservations that can take
 * the units just tapped — reuses `PendingDispatchCard` as-is, so a
 * reservation reads identically here and on `/operaciones/despacho`. Says
 * plainly when none qualifies instead of showing an empty list with no
 * explanation.
 */
const UnitDispatchReservationPicker = ({
  isLoading,
  onClose,
  onSelect,
  reservations,
}: UnitDispatchReservationPickerProps): JSX.Element => (
  <ActionSheet
    icon={MATERIAL_ICON_NAME.CHECKLIST}
    onClose={onClose}
    title={CATEGORY_DETAIL_SCREEN.PICKER_TITLE}
  >
    {isLoading ? (
      <div className="flex justify-center py-lg">
        <Spinner size={SPINNER_SIZE.MEDIUM} />
      </div>
    ) : reservations.length === EMPTY_LENGTH ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {CATEGORY_DETAIL_SCREEN.PICKER_EMPTY}
      </p>
    ) : (
      <div className="flex flex-col gap-sm">
        {reservations.map((reservation) => (
          <PendingDispatchCard
            key={reservation.id}
            onDispatch={onSelect}
            reservation={reservation}
          />
        ))}
      </div>
    )}
  </ActionSheet>
);

export default UnitDispatchReservationPicker;
