"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  EQUIPMENT_VALIDITY,
  RESERVATION_DETAIL_SCREEN,
  RESERVATION_TYPE,
  TRACKING_MODE,
  type EquipmentValidity,
} from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Nullable } from "@/app/types";
import { toDateOnlyParam, toTimeOnlyParam } from "@/app/utils/reservas/calendarRange";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";
import type { ReservationEquipmentItem } from "@/app/utils/reservas/reservationEquipmentItems";
import { updateReservationDetails } from "@/app/utils/reservas/updateReservationDetails";
import { applyReservationEquipmentEdit } from "@/app/utils/reservas/updateReservationEquipment";
import {
  validateNewReservationForm,
  type NewReservationFormErrors,
} from "@/app/utils/reservas/newReservationValidation";
import { useReservationDetailsFields } from "@/app/components/reservation-form/hooks/useReservationDetailsFields";
import { useReservationEquipmentSelection } from "@/app/components/reservation-form/hooks/useReservationEquipmentSelection";
import { useReservationAvailability } from "@/app/components/reservation-form/hooks/useReservationAvailability";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import type { ReservationEditModalFormViewModel } from "../models/ReservationEditModalFormViewModel.interface";

interface UseReservationEditModalFormViewModelParams {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  onSaved: () => void;
  originalItems: ReservationEquipmentItem[];
  reservation: ReservationDetail;
  workerId: string;
}

const buildInitialEquipmentSelection = (
  originalItems: ReservationEquipmentItem[]
): {
  initialQuantities: Record<string, number>;
  initialSelectedUnitIds: string[];
} => {
  const initialQuantities: Record<string, number> = {};
  const initialSelectedUnitIds: string[] = [];
  for (const item of originalItems) {
    if (item.unitId) {
      initialSelectedUnitIds.push(item.unitId);
    } else if (item.categoryId && item.quantity) {
      initialQuantities[item.categoryId] = item.quantity;
    }
  }
  return { initialQuantities, initialSelectedUnitIds };
};

/**
 * US-RES-018: name, people, franja, duration and equipment for a reservation
 * that already exists — only mounts once `ReservationEditModal` has loaded
 * the reservation's current items and the reservable catalog, so every
 * `useState` initializer below sees real data on its first render.
 */
export const useReservationEditModalFormViewModel = ({
  candidateUnits,
  categories,
  onSaved,
  originalItems,
  reservation,
  workerId,
}: UseReservationEditModalFormViewModelParams): ReservationEditModalFormViewModel => {
  const startsAt = new Date(reservation.startsAt);
  const details = useReservationDetailsFields({
    customerName: reservation.customerName,
    date: toDateOnlyParam(startsAt),
    durationMinutes: String(reservation.durationMinutes),
    peopleCount: String(reservation.peopleCount),
    time: toTimeOnlyParam(startsAt),
    type: reservation.type,
  });

  const { initialQuantities, initialSelectedUnitIds } =
    buildInitialEquipmentSelection(originalItems);
  const selection = useReservationEquipmentSelection(
    initialQuantities,
    initialSelectedUnitIds
  );

  const isCombo =
    reservation.type === RESERVATION_TYPE.COMBO;
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
  const candidateUnitsByCategory = useMemo(() => {
    const grouped: Record<string, CandidateUnit[]> = {};
    for (const unit of candidateUnits) {
      grouped[unit.categoryId] = [
        ...(grouped[unit.categoryId] ?? []),
        unit,
      ];
    }
    return grouped;
  }, [candidateUnits]);
  const quantityCategoryIds = useMemo(
    () =>
      byQuantityCategories.map((category) => category.id),
    [byQuantityCategories]
  );

  const availability = useReservationAvailability(
    details.startsAtIso,
    details.endsAtIso,
    quantityCategoryIds,
    selection.selectedUnitIds,
    reservation.id
  );

  const [errors, setErrors] =
    useState<NewReservationFormErrors>({});
  const [formError, setFormError] =
    useState<Nullable<string>>(null);
  const [isSaving, setIsSaving] = useState(false);

  const equipmentValidity: EquipmentValidity =
    isCombo || selection.hasAnySelection
      ? EQUIPMENT_VALIDITY.VALID
      : EQUIPMENT_VALIDITY.INVALID;

  const submit = async (): Promise<void> => {
    setIsSaving(true);
    const supabase = createBrowserSupabaseClient();

    try {
      await updateReservationDetails(
        supabase,
        reservation.id,
        {
          customerName: details.values.customerName.trim(),
          durationMinutes: Number(
            details.values.durationMinutes
          ),
          peopleCount: Number(details.values.peopleCount),
          startsAt: details.startsAtIso,
        },
        workerId
      );

      if (!isCombo) {
        await applyReservationEquipmentEdit(
          supabase,
          reservation.id,
          originalItems,
          selection.quantities,
          selection.selectedUnitIds,
          workerId
        );
      }

      onSaved();
    } catch {
      setIsSaving(false);
      setFormError(RESERVATION_DETAIL_SCREEN.EDIT.ERROR);
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
      equipmentValidity
    );
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
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
    isBusy: isSaving || availability.isChecking,
    isCombo,
    quantities: selection.quantities,
    selectedUnitIds: selection.selectedUnitIds,
    unitConflicts: availability.unitConflicts,
  };
};
