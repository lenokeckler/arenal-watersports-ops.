"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  NEW_RESERVATION_SCREEN,
  PATHS,
  TRACKING_MODE,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import {
  validateNewReservationForm,
  type NewReservationFormErrors,
} from "@/app/utils/reservas/newReservationValidation";
import {
  createReservation,
  type NewReservationEquipmentItem,
} from "@/app/utils/reservas/createReservation";
import { useReservationDetailsFields } from "./useReservationDetailsFields";
import { useReservationEquipmentSelection } from "./useReservationEquipmentSelection";
import { useReservationAvailability } from "./useReservationAvailability";
import type { ReservationFormProps } from "../models/ReservationFormProps.interface";
import type { ReservationFormViewModel } from "../models/ReservationFormViewModel.interface";

const NO_ERRORS = 0;

const buildEquipmentItems = (
  quantities: Record<string, number>,
  selectedUnitIds: string[]
): NewReservationEquipmentItem[] => [
  ...Object.entries(quantities).map(
    ([categoryId, quantity]) => ({
      categoryId,
      quantity,
      unitId: null,
    })
  ),
  ...selectedUnitIds.map((unitId) => ({
    categoryId: null,
    quantity: null,
    unitId,
  })),
];

/**
 * The facade behind `ReservationForm` (US-RES-004, US-RES-007): field
 * state, equipment selection and live availability each own their slice,
 * this only combines them for validation and the create submit.
 */
export const useReservationFormViewModel = ({
  candidateUnits,
  categories,
  workerId,
}: ReservationFormProps): ReservationFormViewModel => {
  const router = useRouter();
  const details = useReservationDetailsFields();
  const selection = useReservationEquipmentSelection();

  const byQuantityCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.trackingMode ===
          TRACKING_MODE.BY_QUANTITY
      ),
    [categories]
  );
  const byUnitCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.trackingMode === TRACKING_MODE.BY_UNIT
      ),
    [categories]
  );
  const quantityCategoryIds = useMemo(
    () =>
      byQuantityCategories.map((category) => category.id),
    [byQuantityCategories]
  );
  const candidateUnitsByCategory = useMemo(() => {
    const grouped: Record<string, typeof candidateUnits> =
      {};
    for (const unit of candidateUnits) {
      grouped[unit.categoryId] = [
        ...(grouped[unit.categoryId] ?? []),
        unit,
      ];
    }
    return grouped;
  }, [candidateUnits]);

  const availability = useReservationAvailability(
    details.startsAtIso,
    details.endsAtIso,
    quantityCategoryIds,
    selection.selectedUnitIds
  );

  const [errors, setErrors] =
    useState<NewReservationFormErrors>({});
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (): Promise<void> => {
    setIsSaving(true);

    const supabase = createBrowserSupabaseClient();
    const items = buildEquipmentItems(
      selection.quantities,
      selection.selectedUnitIds
    );

    try {
      const reservation = await createReservation(
        supabase,
        {
          customerName: details.values.customerName.trim(),
          durationMinutes: Number(
            details.values.durationMinutes
          ),
          items,
          peopleCount: Number(details.values.peopleCount),
          startsAt: details.startsAtIso,
          type: details.values.type,
        },
        workerId
      );
      router.replace(
        PATHS.RESERVATIONS.DETAIL_BY_ID(reservation.id)
      );
    } catch {
      setIsSaving(false);
      setFormError(NEW_RESERVATION_SCREEN.ERROR.GENERIC);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateNewReservationForm(
      details.values,
      details.startsAtIso,
      selection.hasAnySelection
    );
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > NO_ERRORS) {
      return;
    }

    void submit();
  };

  return {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
    categoryAvailability: availability.categoryAvailability,
    detailsValues: details.values,
    errors,
    formError,
    handleCustomerNameChange:
      details.handleCustomerNameChange,
    handleDateChange: details.handleDateChange,
    handleDurationChange: details.handleDurationChange,
    handlePeopleCountChange:
      details.handlePeopleCountChange,
    handleQuantityChange: selection.handleQuantityChange,
    handleSubmit,
    handleTimeChange: details.handleTimeChange,
    handleToggleUnit: selection.handleToggleUnit,
    handleTypeChange: details.handleTypeChange,
    isBusy: isSaving || availability.isChecking,
    quantities: selection.quantities,
    selectedUnitIds: selection.selectedUnitIds,
    unitConflicts: availability.unitConflicts,
  };
};
