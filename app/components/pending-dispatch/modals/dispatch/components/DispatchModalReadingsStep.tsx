import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  DISPATCH_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import type { ReservationEquipmentItem } from "@/app/utils/reservas/reservationEquipmentItems";
import { useDispatchReadingsStepViewModel } from "../hooks/useDispatchReadingsStepViewModel";
import DispatchEquipmentRow from "./DispatchEquipmentRow";

interface DispatchModalReadingsStepProps {
  items: ReservationEquipmentItem[];
  onDispatched: () => void;
  reservationId: string;
  workerId: string;
}

/** US-OPE-002/US-OPE-003: the confirmed equipment, with readings for the units that take one. */
const DispatchModalReadingsStep = (
  props: DispatchModalReadingsStepProps
): JSX.Element => {
  const {
    error,
    handleFuelChange,
    handleSubmit,
    handleUsageChange,
    isBusy,
    rows,
  } = useDispatchReadingsStepViewModel(props);

  return (
    <div className="flex flex-col gap-md">
      {rows.map((row) => (
        <DispatchEquipmentRow
          key={row.itemId}
          isBusy={isBusy}
          onFuelChange={handleFuelChange}
          onUsageChange={handleUsageChange}
          row={row}
        />
      ))}

      {error && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {error}
        </p>
      )}

      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={isBusy}
        onClick={handleSubmit}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          DISPATCH_SCREEN.CONFIRM_SUBMIT
        )}
      </Button>
    </div>
  );
};

export default DispatchModalReadingsStep;
