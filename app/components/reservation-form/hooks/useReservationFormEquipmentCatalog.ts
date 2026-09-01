"use client";

import { useCallback, useMemo } from "react";
import { TRACKING_MODE } from "@/app/constants";
import type {
  CandidateUnit,
  ReservableCategory,
} from "@/app/utils/reservas/newReservationData";

export interface ReservationFormEquipmentCatalog {
  byQuantityCategories: ReservableCategory[];
  byUnitCategories: ReservableCategory[];
  candidateUnitsByCategory: Record<string, CandidateUnit[]>;
}

/**
 * US-RES-007: splits the reservable catalog the way `ReservationFormEquipment`
 * needs it — candidate units grouped by the category they belong to, and
 * categories split into a quantity picker or a unit picker.
 *
 * That split reads differently depending on who is asking:
 * - Reservas (the new-reservation form, US-RES-018's edit modal) only cares
 *   whether the category is `unitsAreInterchangeable` — a jet ski is
 *   `by_unit` inventory but still just a count to Reservas, because nobody
 *   at booking time knows which physical jet ski will be free, charged and
 *   undamaged hours from now. Only the lancha, never interchangeable, asks
 *   Reservas to pick a unit.
 * - Operaciones's dispatch step (US-OPE-002) sets `requireUnitAssignment`
 *   and gets the tracking-mode split instead: every `by_unit` category,
 *   interchangeable or not, must resolve to concrete units before the
 *   equipment goes out, because fuel, hours and damage are tracked per
 *   machine — `DispatchModalEquipmentStep` is where a quantity-booked jet
 *   ski line turns into "which two go out".
 */
export const useReservationFormEquipmentCatalog = (
  categories: ReservableCategory[],
  candidateUnits: CandidateUnit[],
  requireUnitAssignment: boolean = false
): ReservationFormEquipmentCatalog => {
  const isUnitCategory = useCallback(
    (category: ReservableCategory): boolean =>
      requireUnitAssignment
        ? category.trackingMode === TRACKING_MODE.BY_UNIT
        : !category.unitsAreInterchangeable,
    [requireUnitAssignment]
  );

  const byQuantityCategories = useMemo(
    () =>
      categories.filter(
        (category) => !isUnitCategory(category)
      ),
    [categories, isUnitCategory]
  );
  const byUnitCategories = useMemo(
    () => categories.filter(isUnitCategory),
    [categories, isUnitCategory]
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

  return {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
  };
};
