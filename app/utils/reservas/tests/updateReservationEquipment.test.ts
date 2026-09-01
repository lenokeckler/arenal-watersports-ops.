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
});
