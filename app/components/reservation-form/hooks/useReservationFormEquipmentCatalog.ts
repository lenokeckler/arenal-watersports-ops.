"use client";

import { useMemo } from "react";
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
 * needs it — categories by tracking mode, and candidate units grouped by the
 * category they belong to. Shared by the reservation edit modal (US-RES-018)
 * and the dispatch sheet's equipment-confirmation step (US-OPE-002) so both
 * feed the same picker identically.
 */
export const useReservationFormEquipmentCatalog = (
  categories: ReservableCategory[],
  candidateUnits: CandidateUnit[]
): ReservationFormEquipmentCatalog => {
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

  return {
    byQuantityCategories,
    byUnitCategories,
    candidateUnitsByCategory,
  };
};
