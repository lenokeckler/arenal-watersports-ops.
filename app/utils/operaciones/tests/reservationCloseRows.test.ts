import { describe, expect, it } from "vitest";
import { buildReservationCloseRows } from "../reservationCloseRows";
import type { ReservationCloseEquipmentItem } from "../reservationCloseData";

const baseItem: ReservationCloseEquipmentItem = {
  canBeDamaged: false,
  categoryId: "category-1",
  categoryName: "Jet Ski",
  consumesFuel: false,
  fuelOut: null,
  hasMotor: false,
  id: "item-1",
  impactCount: 0,
  quantity: null,
  unitCode: "JS-01",
  unitFuelMax: 4,
  unitId: "unit-1",
  usageMetric: "engine_hours",
  usageOut: null,
};

describe("buildReservationCloseRows", () => {
  it("includes a motorized unit even if it cannot be damaged", () => {
    const rows = buildReservationCloseRows([
      { ...baseItem, hasMotor: true },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].showUsage).toBe(true);
  });

  it("includes a damageable unit with no motor and no fuel", () => {
    const rows = buildReservationCloseRows([
      { ...baseItem, canBeDamaged: true },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].showFuel).toBe(false);
    expect(rows[0].showUsage).toBe(false);
  });

  it("drops a quantity-tracked item with no unit id", () => {
    const rows = buildReservationCloseRows([
      {
        ...baseItem,
        canBeDamaged: true,
        hasMotor: true,
        unitId: null,
      },
    ]);

    expect(rows).toHaveLength(0);
  });

  it("drops a unit that is neither motorized, fuel-consuming nor damageable", () => {
    const rows = buildReservationCloseRows([baseItem]);

    expect(rows).toHaveLength(0);
  });
});
