import { describe, expect, it } from "vitest";
import { groupMachinesByCategory } from "../machineListGrouping";
import type { MachineListUnit } from "../machineList";

const baseUnit: MachineListUnit = {
  categoryId: "category-1",
  categoryName: "Jet Ski",
  code: "JS-01",
  consumesFuel: true,
  fuelLevel: 2,
  fuelMax: 4,
  hasMotor: true,
  id: "unit-1",
  impactCount: 0,
  isOilChangeDue: false,
  status: "available",
  usageMetric: "engine_hours",
  usageTotal: 12,
};

describe("groupMachinesByCategory", () => {
  it("groups units that share a category under one entry", () => {
    const categories = groupMachinesByCategory([
      baseUnit,
      { ...baseUnit, code: "JS-02", id: "unit-2" },
    ]);

    expect(categories).toHaveLength(1);
    expect(categories[0].units).toHaveLength(2);
  });

  it("sorts categories alphabetically by name", () => {
    const categories = groupMachinesByCategory([
      {
        ...baseUnit,
        categoryId: "category-2",
        categoryName: "Quad",
        id: "unit-2",
      },
      { ...baseUnit, categoryId: "category-1" },
    ]);

    expect(
      categories.map((category) => category.categoryName)
    ).toEqual(["Jet Ski", "Quad"]);
  });

  it("drops the category fields from each grouped unit", () => {
    const [category] = groupMachinesByCategory([baseUnit]);

    expect(category.units[0]).not.toHaveProperty(
      "categoryId"
    );
    expect(category.units[0]).not.toHaveProperty(
      "categoryName"
    );
  });

  it("returns no categories for an empty unit list", () => {
    expect(groupMachinesByCategory([])).toEqual([]);
  });
});
