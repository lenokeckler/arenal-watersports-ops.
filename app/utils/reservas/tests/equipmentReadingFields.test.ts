import { describe, expect, it } from "vitest";
import { buildDispatchSheetRows } from "../equipmentReadingFields";
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

describe("buildDispatchSheetRows", () => {
  it("keeps a quantity-tracked item with no reading — kayaks, paddleboards, ...", () => {
    const rows = buildDispatchSheetRows([
      { ...baseItem, quantity: 3 },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].reading).toBeNull();
    expect(rows[0].quantity).toBe(3);
    expect(rows[0].categoryName).toBe("Kayak");
  });

  it("keeps a unit-tracked item with no reading when it neither takes fuel nor has a motor", () => {
    const rows = buildDispatchSheetRows([
      {
        ...baseItem,
        categoryName: "Chaleco",
        unitCode: "CH-01",
        unitId: "unit-1",
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].reading).toBeNull();
    expect(rows[0].unitCode).toBe("CH-01");
  });

  it("attaches a reading to a fuel-consuming unit", () => {
    const rows = buildDispatchSheetRows([
      {
        ...baseItem,
        consumesFuel: true,
        unitCode: "JS-01",
        unitId: "unit-1",
      },
    ]);

    expect(rows[0].reading).not.toBeNull();
    expect(rows[0].reading?.showFuel).toBe(true);
    expect(rows[0].reading?.showUsage).toBe(false);
  });

  it("attaches a reading to a motorized unit", () => {
    const rows = buildDispatchSheetRows([
      {
        ...baseItem,
        hasMotor: true,
        unitCode: "PT-01",
        unitId: "unit-1",
      },
    ]);

    expect(rows[0].reading).not.toBeNull();
    expect(rows[0].reading?.showFuel).toBe(false);
    expect(rows[0].reading?.showUsage).toBe(true);
  });

  it("never drops an item — the sheet lists everything the reservation commits", () => {
    const rows = buildDispatchSheetRows([
      { ...baseItem, quantity: 2 },
      { ...baseItem, id: "item-2", quantity: 1 },
    ]);

    expect(rows).toHaveLength(2);
  });
});
