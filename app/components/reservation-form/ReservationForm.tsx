"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MATERIAL_ICON_NAME,
  NEW_RESERVATION_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import { useReservationFormViewModel } from "./hooks/useReservationFormViewModel";
import ReservationFormDetails from "./components/ReservationFormDetails";
import ReservationFormEquipment from "./components/ReservationFormEquipment";
import type { ReservationFormProps } from "./models/ReservationFormProps.interface";

/**
 * `/reservas/nueva` (US-RES-004 through US-RES-007, US-RES-015 through
 * US-RES-017). Presentation only — every decision lives in
 * `useReservationFormViewModel`.
 */
const ReservationForm = (
  props: ReservationFormProps
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
    handleTypeChange,
    isBusy,
    quantities,
    selectedUnitIds,
    unitConflicts,
  } = useReservationFormViewModel(props);

  return (
    <form
      className="flex flex-col gap-md rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md"
      onSubmit={handleSubmit}
      noValidate
    >
      {formError && (
        <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
          {formError}
        </p>
      )}

      <ReservationFormDetails
        errors={errors}
        isBusy={isBusy}
        onCustomerNameChange={handleCustomerNameChange}
        onDateChange={handleDateChange}
        onDurationChange={handleDurationChange}
        onPeopleCountChange={handlePeopleCountChange}
        onTimeChange={handleTimeChange}
        onTypeChange={handleTypeChange}
        values={detailsValues}
      />

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

      <Button
        type={BUTTON_TYPES.SUBMIT}
        variant={BUTTON.BASE}
        disabled={isBusy}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md transition-transform duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <Spinner size={SPINNER_SIZE.SMALL} />
        ) : (
          <>
            <span>{NEW_RESERVATION_SCREEN.SUBMIT}</span>
            <MaterialIcon
              name={MATERIAL_ICON_NAME.SAVE}
              className="!text-[18px]"
            />
          </>
        )}
      </Button>
    </form>
  );
};

export default ReservationForm;
