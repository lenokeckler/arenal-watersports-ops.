import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  DISPATCH_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import ReservationFormEquipment from "@/app/components/reservation-form/components/ReservationFormEquipment";
import type { ReservationEquipmentItem } from "@/app/utils/reservas/reservationEquipmentItems";
import { useDispatchEquipmentStepViewModel } from "../hooks/useDispatchEquipmentStepViewModel";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";

interface DispatchModalEquipmentStepProps {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  isCombo: boolean;
  onConfirmed: (items: ReservationEquipmentItem[]) => void;
  originalItems: ReservationEquipmentItem[];
  reservationEndsAt: string;
  reservationId: string;
  reservationStartsAt: string;
  workerId: string;
}

/**
 * US-OPE-002: what the reservation commits, editable before dispatch — a
 * combo's equipment is fixed by its definition, so it only ever shows a
 * locked note and a way to continue.
 */
const DispatchModalEquipmentStep = (
  props: DispatchModalEquipmentStepProps
): JSX.Element => {
  const { isCombo } = props;
  const {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
    categoryAvailability,
    error,
    handleConfirm,
    handleQuantityChange,
    handleToggleUnit,
    isBusy,
    quantities,
    selectedUnitIds,
    unitConflicts,
  } = useDispatchEquipmentStepViewModel(props);

  return (
    <div className="flex flex-col gap-md">
      <h3 className="font-title-md text-title-md text-on-surface">
        {DISPATCH_SCREEN.EQUIPMENT_STEP.TITLE}
      </h3>

      {isCombo ? (
        <p className="font-body-base text-body-base text-on-surface-variant">
          {DISPATCH_SCREEN.EQUIPMENT_STEP.LOCKED_NOTE}
        </p>
      ) : (
        <ReservationFormEquipment
          byQuantityCategories={byQuantityCategories}
          byUnitCategories={byUnitCategories}
          candidateUnitsByCategory={
            candidateUnitsByCategory
          }
          categoryAvailability={categoryAvailability}
          isBusy={isBusy}
          onQuantityChange={handleQuantityChange}
          onToggleUnit={handleToggleUnit}
          quantities={quantities}
          selectedUnitIds={selectedUnitIds}
          unitConflicts={unitConflicts}
        />
      )}

      {error && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {error}
        </p>
      )}

      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={isBusy}
        onClick={handleConfirm}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          DISPATCH_SCREEN.EQUIPMENT_STEP.CONTINUE
        )}
      </Button>
    </div>
  );
};

export default DispatchModalEquipmentStep;
