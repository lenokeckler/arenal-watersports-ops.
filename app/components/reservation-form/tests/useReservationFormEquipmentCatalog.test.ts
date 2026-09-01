import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  RESERVATION_TYPE,
  TRACKING_MODE,
} from "@/app/constants";
import { filterCategoriesForReservationType } from "@/app/utils/reservas/groupCategories";
import type { ReservableCategory } from "@/app/utils/reservas/newReservationData";
import { useReservationFormEquipmentCatalog } from "../hooks/useReservationFormEquipmentCatalog";

const kayak: ReservableCategory = {
  groupName: null,
  guideOnly: false,
  id: "kayak",
  name: "Kayak",
  trackingMode: TRACKING_MODE.BY_QUANTITY,
};

const lancha: ReservableCategory = {
  groupName: null,
  guideOnly: true,
  id: "lancha",
  name: "Lancha",
  trackingMode: TRACKING_MODE.BY_UNIT,
};

/**
 * US-RES-008: guards the wiring itself, not just `filterCategoriesForReservationType`
 * in isolation — every screen that offers the reservable catalog
 * (`useReservationFormViewModel`, `useReservationEditModalFormViewModel`,
 * and the dispatch equipment step's `dispatchEquipmentCatalog`) must filter
 * before handing categories to this hook. This is the exact composition all
 * three rely on; a caller that forgets to filter is what actually happened.
 */
describe("useReservationFormEquipmentCatalog composed with filterCategoriesForReservationType", () => {
  it("excludes a guide-only unit category for a rental", () => {
    const visibleCategories =
      filterCategoriesForReservationType(
        [kayak, lancha],
        RESERVATION_TYPE.RENTAL
      );

    const { result } = renderHook(() =>
      useReservationFormEquipmentCatalog(
        visibleCategories,
        []
      )
    );

    expect(result.current.byUnitCategories).toEqual([]);
    expect(result.current.byQuantityCategories).toEqual([
      kayak,
    ]);
  });

  it("keeps a guide-only unit category for a tour", () => {
    const visibleCategories =
      filterCategoriesForReservationType(
        [kayak, lancha],
        RESERVATION_TYPE.TOUR
      );

    const { result } = renderHook(() =>
      useReservationFormEquipmentCatalog(
        visibleCategories,
        []
      )
    );

    expect(result.current.byUnitCategories).toEqual([
      lancha,
    ]);
  });

  it("keeps a guide-only unit category for a combo", () => {
    const visibleCategories =
      filterCategoriesForReservationType(
        [kayak, lancha],
        RESERVATION_TYPE.COMBO
      );

    const { result } = renderHook(() =>
      useReservationFormEquipmentCatalog(
        visibleCategories,
        []
      )
    );

    expect(result.current.byUnitCategories).toEqual([
      lancha,
    ]);
  });
});
