"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DISPATCH_SCREEN } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";
import type { Database, Nullable } from "@/app/types";
import {
  fetchReservationEquipmentItems,
  type ReservationEquipmentItem,
} from "@/app/utils/reservas/reservationEquipmentItems";
import {
  applyReservationEquipmentEdit,
  buildInitialEquipmentSelection,
} from "@/app/utils/reservas/updateReservationEquipment";
import { useReservationEquipmentSelection } from "@/app/components/reservation-form/hooks/useReservationEquipmentSelection";
import { useReservationAvailability } from "@/app/components/reservation-form/hooks/useReservationAvailability";
import { useReservationFormEquipmentCatalog } from "@/app/components/reservation-form/hooks/useReservationFormEquipmentCatalog";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";
import type {
  CategoryAvailability,
  UnitConflict,
} from "@/app/utils/reservas/availabilityQueries";

interface UseDispatchEquipmentStepViewModelParams {
  candidateUnits: CandidateUnit[];
  categories: ReservableCategory[];
  isCombo: boolean;
  onConfirmed: (items: ReservationEquipmentItem[]) => void;
  originalItems: ReservationEquipmentItem[];
  /**
   * US-OPE-002 (tablero entry): units operaciones already tapped on
   * `CategoryDetail` before picking this reservation — the equipment step
   * opens with those pre-selected instead of asking again.
   */
  preselectedUnitIds: string[];
  reservationEndsAt: string;
  reservationId: string;
  reservationStartsAt: string;
  workerId: string;
}

export interface UseDispatchEquipmentStepViewModelReturn {
  byQuantityCategories: ReservableCategory[];
  byUnitCategories: ReservableCategory[];
  candidateUnitsByCategory: Record<string, CandidateUnit[]>;
  categoryAvailability: Record<
    string,
    CategoryAvailability
  >;
  error: Nullable<string>;
  handleConfirm: () => void;
  handleQuantityChange: (
    categoryId: string,
    quantity: number
  ) => void;
  handleToggleUnit: (unitId: string) => void;
  isBusy: boolean;
  quantities: Record<string, number>;
  requiredUnitQuantities: Record<string, number>;
  selectedUnitIds: string[];
  unitConflicts: Record<string, UnitConflict[]>;
}

/**
 * US-OPE-002: whether every by-unit category that owes concrete units
 * (`requiredUnitQuantities`) has exactly that many selected — a jet ski
 * agendada as "2" cannot go out with only one picked, and the picker
 * itself already stops it from getting a third.
 */
const hasCompleteUnitAssignment = (
  requiredUnitQuantities: Record<string, number>,
  candidateUnitsByCategory: Record<string, CandidateUnit[]>,
  selectedUnitIds: string[]
): boolean =>
  Object.entries(requiredUnitQuantities).every(
    ([categoryId, requiredQuantity]) =>
      (candidateUnitsByCategory[categoryId] ?? []).filter(
        (unit) => selectedUnitIds.includes(unit.id)
      ).length === requiredQuantity
  );

/**
 * US-OPE-002: writes the equipment diff while the reservation is still
 * `scheduled` — exactly like US-RES-018's edit modal — then hands the
 * fresh committed items to the readings step. Nothing here decides money;
 * `applyReservationEquipmentEdit` only ever touches `reservation_items`.
 */
const confirmEquipmentChange = async (
  supabase: SupabaseClient<Database>,
  reservationId: string,
  originalItems: ReservationEquipmentItem[],
  quantities: Record<string, number>,
  selectedUnitIds: string[],
  workerId: string
): Promise<ReservationEquipmentItem[]> => {
  await applyReservationEquipmentEdit(
    supabase,
    reservationId,
    originalItems,
    quantities,
    selectedUnitIds,
    workerId
  );
  return fetchReservationEquipmentItems(
    supabase,
    reservationId
  );
};

/** US-OPE-002: whether the dispatch step requires physical units for this category. */
const REQUIRE_UNIT_ASSIGNMENT = true;

export const useDispatchEquipmentStepViewModel = ({
  candidateUnits,
  categories,
  isCombo,
  onConfirmed,
  originalItems,
  preselectedUnitIds,
  reservationEndsAt,
  reservationId,
  reservationStartsAt,
  workerId,
}: UseDispatchEquipmentStepViewModelParams): UseDispatchEquipmentStepViewModelReturn => {
  // US-OPE-002: unlike Reservas' own equipment step, every by-unit category
  // needs concrete units here, interchangeable or not — fuel, hours and
  // damage are tracked per machine.
  const {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
  } = useReservationFormEquipmentCatalog(
    categories,
    candidateUnits,
    REQUIRE_UNIT_ASSIGNMENT
  );
  const byUnitCategoryIds = useMemo(
    () => byUnitCategories.map((category) => category.id),
    [byUnitCategories]
  );

  const {
    initialQuantities,
    initialSelectedUnitIds,
    unitQuantityRequirements,
  } = buildInitialEquipmentSelection(
    originalItems,
    byUnitCategoryIds,
    preselectedUnitIds
  );
  const selection = useReservationEquipmentSelection(
    initialQuantities,
    initialSelectedUnitIds
  );

  const quantityCategoryIds = useMemo(
    () =>
      byQuantityCategories.map((category) => category.id),
    [byQuantityCategories]
  );

  const availability = useReservationAvailability(
    reservationStartsAt,
    reservationEndsAt,
    quantityCategoryIds,
    selection.selectedUnitIds,
    reservationId
  );

  const [error, setError] =
    useState<Nullable<string>>(null);
  const [isWriting, setIsWriting] = useState(false);

  const handleConfirm = (): void => {
    if (isCombo) {
      onConfirmed(originalItems);
      return;
    }
    if (!selection.hasAnySelection) {
      setError(DISPATCH_SCREEN.EQUIPMENT_STEP.EMPTY_ERROR);
      return;
    }
    if (
      !hasCompleteUnitAssignment(
        unitQuantityRequirements,
        candidateUnitsByCategory,
        selection.selectedUnitIds
      )
    ) {
      setError(
        DISPATCH_SCREEN.EQUIPMENT_STEP
          .UNITS_INCOMPLETE_ERROR
      );
      return;
    }

    setIsWriting(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();

    void confirmEquipmentChange(
      supabase,
      reservationId,
      originalItems,
      selection.quantities,
      selection.selectedUnitIds,
      workerId
    )
      .then(onConfirmed)
      .catch(() => {
        setIsWriting(false);
        setError(DISPATCH_SCREEN.EQUIPMENT_STEP.ERROR);
      });
  };

  return {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
    categoryAvailability: availability.categoryAvailability,
    error,
    handleConfirm,
    handleQuantityChange: selection.handleQuantityChange,
    handleToggleUnit: selection.handleToggleUnit,
    isBusy: isWriting || availability.isChecking,
    quantities: selection.quantities,
    requiredUnitQuantities: unitQuantityRequirements,
    selectedUnitIds: selection.selectedUnitIds,
    unitConflicts: availability.unitConflicts,
  };
};
