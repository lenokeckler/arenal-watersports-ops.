import type { Nullable } from "@/app/types";
import {
  UNIT_FORM_SCREEN,
  type UnitStatus,
} from "@/app/constants";

export interface UnitFormValues {
  code: string;
  currentFuel: string;
  nextOilChangeAt: string;
  status: UnitStatus;
  usageTotal: string;
}

export interface UnitFormErrors {
  code?: string;
  currentFuel?: string;
}

const MAX_FUEL_PERCENTAGE = 100;
const MIN_FUEL_PERCENTAGE = 0;

const toNullableNumber = (
  rawValue: string
): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

/**
 * Mirrors `units_fuel_range` on `equipment_units`
 * (`supabase/migrations/20260828000400_inventory.sql`) so a mistake lands
 * next to the field instead of as a raw database rejection (US-ADM-016).
 */
export const validateUnitForm = (
  values: UnitFormValues
): UnitFormErrors => {
  const errors: UnitFormErrors = {};

  if (!values.code.trim()) {
    errors.code = UNIT_FORM_SCREEN.ERROR.CODE_REQUIRED;
  }

  const fuel = toNullableNumber(values.currentFuel);
  if (
    typeof fuel === "number" &&
    (fuel < MIN_FUEL_PERCENTAGE ||
      fuel > MAX_FUEL_PERCENTAGE)
  ) {
    errors.currentFuel = UNIT_FORM_SCREEN.ERROR.GENERIC;
  }

  return errors;
};

export interface UnitWritePayload {
  code: string;
  current_fuel: Nullable<number>;
  next_oil_change_at: Nullable<number>;
  status: UnitStatus;
  usage_total: number;
}

const DEFAULT_USAGE_TOTAL = 0;

export const buildUnitPayload = (
  values: UnitFormValues
): UnitWritePayload => ({
  code: values.code.trim(),
  current_fuel: toNullableNumber(values.currentFuel),
  next_oil_change_at: toNullableNumber(
    values.nextOilChangeAt
  ),
  status: values.status,
  usage_total:
    toNullableNumber(values.usageTotal) ??
    DEFAULT_USAGE_TOTAL,
});
