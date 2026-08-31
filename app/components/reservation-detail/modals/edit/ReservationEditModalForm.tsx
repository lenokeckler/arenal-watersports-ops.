"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  RESERVATION_DETAIL_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import ReservationFormEquipment from "@/app/components/reservation-form/components/ReservationFormEquipment";
import ReservationEditModalFields from "./components/ReservationEditModalFields";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import type { ReservationEquipmentItem } from "@/app/utils/reservas/reservationEquipmentItems";
import { useReservationEditModalFormViewModel } from "./hooks/useReservationEditModalFormViewModel";

interface ReservationEditModalFormProps {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  onSaved: () => void;
  originalItems: ReservationEquipmentItem[];
  reservation: ReservationDetail;
  workerId: string;
}

/**
 * US-RES-018: only mounts once the current items and reservable catalog
 * have loaded — see `ReservationEditModal` for why the loading gate lives
 * one level up instead of inside this ViewModel.
 */
const ReservationEditModalForm = (
  props: ReservationEditModalFormProps
): JSX.Element => {
  const {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
    categoryAvailability,
    detailsValues,
    errors,
    formError,
    handleCustomerNameChange,
    handleDateChange,
    handleDurationChange,
    handlePeopleCountChange,
    handleQuantityChange,
    handleSubmit,
    handleTimeChange,
    handleToggleUnit,
    isBusy,
    isCombo,
    quantities,
    selectedUnitIds,
    unitConflicts,
  } = useReservationEditModalFormViewModel(props);

  return (
    <form
      className="flex flex-col gap-md"
      onSubmit={handleSubmit}
      noValidate
    >
      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {formError}
        </p>
      )}

      <ReservationEditModalFields
        errors={errors}
        isBusy={isBusy}
        onCustomerNameChange={handleCustomerNameChange}
        onDateChange={handleDateChange}
        onDurationChange={handleDurationChange}
        onPeopleCountChange={handlePeopleCountChange}
        onTimeChange={handleTimeChange}
        values={detailsValues}
      />

      {isCombo ? (
        <p className="font-body-base text-body-base text-on-surface-variant">
          {
            RESERVATION_DETAIL_SCREEN.EDIT
              .COMBO_LOCKED_NOTE
          }
        </p>
      ) : (
        <ReservationFormEquipment
          byQuantityCategories={byQuantityCategories}
          byUnitCategories={byUnitCategories}
          candidateUnitsByCategory={candidateUnitsByCategory}
          categoryAvailability={categoryAvailability}
          equipmentError={errors.equipment}
          isBusy={isBusy}
          onQuantityChange={handleQuantityChange}
          onToggleUnit={handleToggleUnit}
          quantities={quantities}
          selectedUnitIds={selectedUnitIds}
          unitConflicts={unitConflicts}
        />
      )}

      <Button
        type={BUTTON_TYPES.SUBMIT}
        variant={BUTTON.BASE}
        disabled={isBusy}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          RESERVATION_DETAIL_SCREEN.EDIT.SUBMIT
        )}
      </Button>
    </form>
  );
};

export default ReservationEditModalForm;
