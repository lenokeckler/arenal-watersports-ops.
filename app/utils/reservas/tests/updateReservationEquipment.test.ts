import { describe, expect, it } from "vitest";
import { buildInitialEquipmentSelection } from "../updateReservationEquipment";
import type { ReservationEquipmentItem } from "../reservationEquipmentItems";

const baseItem: ReservationEquipmentItem = {
  categoryId: "category-1",
  categoryName: "Kayak",
  consumesFuel: false,
  fuelOut: null,
  hasMotor: false,
  id: "item-1",
  quantity: null,
  unitCode: null,
  unitFuelMax: null,
  unitId: null,
  usageMetric: null,
  usageOut: null,
};

describe("buildInitialEquipmentSelection", () => {
  it("seeds a unit-tracked item as a selected unit id", () => {
    const { initialQuantities, initialSelectedUnitIds } =
      buildInitialEquipmentSelection([
        { ...baseItem, unitId: "unit-1" },
      ]);

    expect(initialSelectedUnitIds).toEqual(["unit-1"]);
    expect(initialQuantities).toEqual({});
  });

  it("seeds a quantity-tracked item under its category id", () => {
    const { initialQuantities, initialSelectedUnitIds } =
      buildInitialEquipmentSelection([
        { ...baseItem, quantity: 4 },
      ]);

    expect(initialQuantities).toEqual({
      "category-1": 4,
    });
    expect(initialSelectedUnitIds).toEqual([]);
  });

  it("skips a quantity-tracked item with no category or a zero quantity", () => {
    const { initialQuantities } =
      buildInitialEquipmentSelection([
        { ...baseItem, categoryId: null, quantity: 4 },
        { ...baseItem, quantity: 0 },
      ]);

    expect(initialQuantities).toEqual({});
  });

  it("mixes unit-tracked and quantity-tracked items from the same reservation", () => {
    const { initialQuantities, initialSelectedUnitIds } =
      buildInitialEquipmentSelection([
        { ...baseItem, unitId: "unit-1" },
        {
          ...baseItem,
          id: "item-2",
          categoryId: "category-2",
          quantity: 2,
        },
      ]);

    expect(initialSelectedUnitIds).toEqual(["unit-1"]);
    expect(initialQuantities).toEqual({ "category-2": 2 });
  });

  it("returns no unit quantity requirements by default", () => {
    const { unitQuantityRequirements } =
      buildInitialEquipmentSelection([
        { ...baseItem, quantity: 4 },
      ]);

    expect(unitQuantityRequirements).toEqual({});
  });

  describe("US-OPE-002: dispatching a quantity-booked by-unit category", () => {
    it("moves a quantity line for a by-unit category into unitQuantityRequirements instead of initialQuantities", () => {
      const {
        initialQuantities,
        unitQuantityRequirements,
      } = buildInitialEquipmentSelection(
        [
          {
            ...baseItem,
            categoryId: "jet-ski",
            quantity: 2,
          },
        ],
        ["jet-ski"]
      );

      expect(initialQuantities).toEqual({});
      expect(unitQuantityRequirements).toEqual({
        "jet-ski": 2,
      });
    });

    it("leaves a quantity line for a category outside byUnitCategoryIds untouched", () => {
      const {
        initialQuantities,
        unitQuantityRequirements,
      } = buildInitialEquipmentSelection(
        [{ ...baseItem, categoryId: "kayak", quantity: 3 }],
        ["jet-ski"]
      );

      expect(initialQuantities).toEqual({ kayak: 3 });
      expect(unitQuantityRequirements).toEqual({});
    });

    it("seeds initialSelectedUnitIds with units already tapped on the board, deduplicated against committed units", () => {
      const { initialSelectedUnitIds } =
        buildInitialEquipmentSelection(
          [{ ...baseItem, unitId: "unit-1" }],
          [],
          ["unit-1", "unit-2"]
        );

      expect(initialSelectedUnitIds).toEqual([
        "unit-1",
        "unit-2",
      ]);
    });
  });
});
