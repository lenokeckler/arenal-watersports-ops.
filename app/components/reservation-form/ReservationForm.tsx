"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  COMBO_MODE,
  MATERIAL_ICON_NAME,
  NEW_RESERVATION_SCREEN,
  RESERVATION_TYPE,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Spinner from "@/app/components/spinner/Spinner";
import { useReservationFormViewModel } from "./hooks/useReservationFormViewModel";
import ReservationFormDetails from "./components/ReservationFormDetails";
import ReservationFormEquipment from "./components/ReservationFormEquipment";
import ReservationFormCombo from "./components/ReservationFormCombo";
import ReservationFormComboCustomPrice from "./components/ReservationFormComboCustomPrice";
import ReservationFormExtras from "./components/ReservationFormExtras";
import ReservationFormGuides from "./components/ReservationFormGuides";
import type { ReservationFormProps } from "./models/ReservationFormProps.interface";

/**
 * `/reservas/nueva` (US-RES-004 through US-RES-012, US-RES-015 through
 * US-RES-017). Presentation only — every decision lives in
 * `useReservationFormViewModel`.
 */
const ReservationForm = (
  props: ReservationFormProps
): JSX.Element => {
  const { candidateUnits } = props;
  const {
    agreedAmount,
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
    categoryAvailability,
    comboMode,
    comboUnitSelections,
    combos,
    customComboSuggestedAmountCrc,
    customComboSuggestedAmountUsd,
    detailsValues,
    errors,
    extrasByUnit,
    formError,
    guides,
    handleAgreedAmountChange,
    handleComboModeChange,
    handleCustomerNameChange,
    handleDateChange,
    handleDurationChange,
    handlePeopleCountChange,
    handleQuantityChange,
    handleSelectCombo,
    handleSubmit,
    handleTimeChange,
    handleToggleComboUnit,
    handleToggleExtra,
    handleToggleGuide,
    handleToggleUnit,
    handleTypeChange,
    isBusy,
    quantities,
    selectedCombo,
    selectedExtraIdsByUnit,
    selectedGuideIds,
    selectedUnitIds,
    selectedUnitIdsForExtras,
    unitConflicts,
  } = useReservationFormViewModel(props);

  const isCombo =
    detailsValues.type === RESERVATION_TYPE.COMBO;
  const isTour =
    detailsValues.type === RESERVATION_TYPE.TOUR;
  const isCustomCombo =
    isCombo && comboMode === COMBO_MODE.CUSTOM;

  return (
    <form
      className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container/40 p-md backdrop-blur-md"
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

      {isCombo ? (
        <>
          <ReservationFormCombo
            candidateUnitsByCategory={
              candidateUnitsByCategory
            }
            combos={combos}
            comboUnitSelections={comboUnitSelections}
            isBusy={isBusy}
            mode={comboMode}
            onModeChange={handleComboModeChange}
            onSelectCombo={handleSelectCombo}
            onToggleComboUnit={handleToggleComboUnit}
            selectedCombo={selectedCombo}
          />
          {errors.equipment && (
            <p className="font-label-mono text-label-mono text-error">
              {errors.equipment}
            </p>
          )}
          {isCustomCombo && (
            <>
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
              <ReservationFormComboCustomPrice
                agreedAmount={agreedAmount}
                isBusy={isBusy}
                onAgreedAmountChange={
                  handleAgreedAmountChange
                }
                suggestedAmountCrc={
                  customComboSuggestedAmountCrc
                }
                suggestedAmountUsd={
                  customComboSuggestedAmountUsd
                }
              />
            </>
          )}
        </>
      ) : (
        <ReservationFormEquipment
          byQuantityCategories={byQuantityCategories}
          byUnitCategories={byUnitCategories}
          candidateUnitsByCategory={
            candidateUnitsByCategory
          }
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

      <ReservationFormExtras
        candidateUnits={candidateUnits}
        extrasByUnit={extrasByUnit}
        isBusy={isBusy}
        onToggleExtra={handleToggleExtra}
        selectedExtraIdsByUnit={selectedExtraIdsByUnit}
        selectedUnitIds={selectedUnitIdsForExtras}
      />

      {isTour && (
        <ReservationFormGuides
          guides={guides}
          isBusy={isBusy}
          onToggleGuide={handleToggleGuide}
          selectedGuideIds={selectedGuideIds}
        />
      )}

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
