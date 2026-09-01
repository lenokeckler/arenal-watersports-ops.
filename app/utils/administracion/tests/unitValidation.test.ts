import { describe, expect, it } from "vitest";
import { UNIT_STATUS } from "@/app/constants";
import {
  buildUnitPayload,
  validateUnitForm,
  type UnitFormValues,
} from "../unitValidation";

const baseValues: UnitFormValues = {
  code: "JET-05",
  fuelLevel: "",
  fuelMax: "",
  nextOilChangeAt: "",
  status: UNIT_STATUS.AVAILABLE,
  usageTotal: "",
};

describe("validateUnitForm", () => {
  it("accepts a blank fuel level and a blank fuel max — both fall back to the database default", () => {
    const errors = validateUnitForm(baseValues);

    expect(errors.fuelLevel).toBeUndefined();
    expect(errors.fuelMax).toBeUndefined();
  });

  it("accepts a fuel level equal to the unit's own fuel max", () => {
    const errors = validateUnitForm({
      ...baseValues,
      fuelLevel: "4",
      fuelMax: "4",
    });

    expect(errors.fuelLevel).toBeUndefined();
  });

  it("rejects a fuel level above the unit's own fuel max — mirrors units_fuel_level_range", () => {
    const errors = validateUnitForm({
      ...baseValues,
      fuelLevel: "5",
      fuelMax: "4",
    });

    expect(errors.fuelLevel).toBeDefined();
  });

  it("rejects a fuel level above the default max when fuel max is left blank", () => {
    const errors = validateUnitForm({
      ...baseValues,
      fuelLevel: "5",
    });

    expect(errors.fuelLevel).toBeDefined();
  });

  it("rejects a fuel max outside 1-20 — mirrors units_fuel_max_range", () => {
    const tooLow = validateUnitForm({
      ...baseValues,
      fuelMax: "0",
    });
    const tooHigh = validateUnitForm({
      ...baseValues,
      fuelMax: "21",
    });

    expect(tooLow.fuelMax).toBeDefined();
    expect(tooHigh.fuelMax).toBeDefined();
  });

  it("requires a code", () => {
    const errors = validateUnitForm({
      ...baseValues,
      code: "  ",
    });

    expect(errors.code).toBeDefined();
  });
});

describe("buildUnitPayload", () => {
  it("defaults fuel_max to the database default when left blank", () => {
    const payload = buildUnitPayload(baseValues);

    expect(payload.fuel_max).toBe(4);
    expect(payload.fuel_level).toBeNull();
  });

  it("carries the typed fuel level and fuel max through as numbers", () => {
    const payload = buildUnitPayload({
      ...baseValues,
      fuelLevel: "3",
      fuelMax: "6",
    });

    expect(payload.fuel_level).toBe(3);
    expect(payload.fuel_max).toBe(6);
  });
});
