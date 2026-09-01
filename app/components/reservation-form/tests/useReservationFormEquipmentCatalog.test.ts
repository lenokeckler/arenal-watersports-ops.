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
  unitsAreInterchangeable: true,
};

const lancha: ReservableCategory = {
  groupName: null,
  guideOnly: true,
  id: "lancha",
  name: "Lancha",
  trackingMode: TRACKING_MODE.BY_UNIT,
  unitsAreInterchangeable: false,
};

const jetSki: ReservableCategory = {
  groupName: null,
  guideOnly: false,
  id: "jet-ski",
  name: "Jet Ski",
  trackingMode: TRACKING_MODE.BY_UNIT,
  unitsAreInterchangeable: true,
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

/**
 * The business rule behind this split: at booking time, nobody knows which
 * physical jet ski will be free hours from now, so an interchangeable
 * `by_unit` category (jet ski, cuadraciclo) reads as a quantity to Reservas
 * even though it is tracked by unit in inventory — only the lancha, never
 * interchangeable, still asks for a specific unit.
 */
describe("useReservationFormEquipmentCatalog default split (Reservas)", () => {
  it("treats an interchangeable by-unit category as a quantity category", () => {
    const { result } = renderHook(() =>
      useReservationFormEquipmentCatalog(
        [kayak, lancha, jetSki],
        []
      )
    );

    expect(result.current.byQuantityCategories).toEqual([
      kayak,
      jetSki,
    ]);
    expect(result.current.byUnitCategories).toEqual([
      lancha,
    ]);
  });
});

/**
 * US-OPE-002: at dispatch, fuel, hours and damage are tracked per machine,
 * so every `by_unit` category needs concrete units regardless of whether
 * Reservas treats it as interchangeable — `requireUnitAssignment` opts a
 * caller (the dispatch equipment step) back into the tracking-mode split.
 */
describe("useReservationFormEquipmentCatalog with requireUnitAssignment (dispatch)", () => {
  it("treats every by-unit category as needing concrete units", () => {
    const { result } = renderHook(() =>
      useReservationFormEquipmentCatalog(
        [kayak, lancha, jetSki],
        [],
        true
      )
    );

    expect(result.current.byQuantityCategories).toEqual([
      kayak,
    ]);
    expect(result.current.byUnitCategories).toEqual([
      lancha,
      jetSki,
    ]);
  });
});
