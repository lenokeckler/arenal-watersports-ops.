import type { Nullable } from "@/app/types";
import {
  FUEL_LEVEL_NUMBERS,
  UNIT_FORM_SCREEN,
  type UnitStatus,
} from "@/app/constants";

export interface UnitFormValues {
  code: string;
  fuelLevel: string;
  fuelMax: string;
  nextOilChangeAt: string;
  status: UnitStatus;
  usageTotal: string;
}

export interface UnitFormErrors {
  code?: string;
  fuelLevel?: string;
  fuelMax?: string;
}

const toNullableNumber = (
  rawValue: string
): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

/**
 * Mirrors `units_fuel_max_range`/`units_fuel_level_range` on
 * `equipment_units` (`supabase/migrations/20260828002200_fuel_lines.sql`) so
 * a mistake lands next to the field instead of as a raw database rejection
 * (US-ADM-016). `fuelLevel` is validated against `fuelMax` itself — a blank
 * `fuelMax` falls back to the same default the database writes.
 */
export const validateUnitForm = (
  values: UnitFormValues
): UnitFormErrors => {
  const errors: UnitFormErrors = {};

  if (!values.code.trim()) {
    errors.code = UNIT_FORM_SCREEN.ERROR.CODE_REQUIRED;
  }

  const fuelMax =
    toNullableNumber(values.fuelMax) ??
    FUEL_LEVEL_NUMBERS.DEFAULT_MAX;
  if (
    fuelMax < FUEL_LEVEL_NUMBERS.MIN_MAX ||
    fuelMax > FUEL_LEVEL_NUMBERS.MAX_MAX
  ) {
    errors.fuelMax = UNIT_FORM_SCREEN.ERROR.GENERIC;
  }

  const fuelLevel = toNullableNumber(values.fuelLevel);
  if (
    typeof fuelLevel === "number" &&
    (fuelLevel < FUEL_LEVEL_NUMBERS.MIN ||
      fuelLevel > fuelMax)
  ) {
    errors.fuelLevel = UNIT_FORM_SCREEN.ERROR.GENERIC;
  }

  return errors;
};

export interface UnitWritePayload {
  code: string;
  fuel_level: Nullable<number>;
  fuel_max: number;
  next_oil_change_at: Nullable<number>;
  status: UnitStatus;
  usage_total: number;
}

const DEFAULT_USAGE_TOTAL = 0;

export const buildUnitPayload = (
  values: UnitFormValues
): UnitWritePayload => ({
  code: values.code.trim(),
  fuel_level: toNullableNumber(values.fuelLevel),
  fuel_max:
    toNullableNumber(values.fuelMax) ??
    FUEL_LEVEL_NUMBERS.DEFAULT_MAX,
  next_oil_change_at: toNullableNumber(
    values.nextOilChangeAt
  ),
  status: values.status,
  usage_total:
    toNullableNumber(values.usageTotal) ??
    DEFAULT_USAGE_TOTAL,
});
