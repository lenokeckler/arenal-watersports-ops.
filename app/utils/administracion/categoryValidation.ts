import type { Nullable } from "@/app/types";
import {
  CATEGORY_FORM_SCREEN,
  TRACKING_MODE,
  type TrackingMode,
  type UsageMetric,
} from "@/app/constants";

export interface CategoryFormValues {
  alertExpiryDays: string;
  alertMinQuantity: string;
  canBeDamaged: boolean;
  consumesFuel: boolean;
  defaultDurationMinutes: string;
  depositCrc: string;
  depositUsd: string;
  guideOnly: boolean;
  hasConditionPhotos: boolean;
  hasMotor: boolean;
  /**
   * Nombre con el que esta categoria se muestra junto a otras. Vacio es el
   * caso normal: se muestra sola.
   */
  groupName: string;
  isReservable: boolean;
  name: string;
  trackingMode: TrackingMode;
  usageMetric: Nullable<UsageMetric>;
}

export interface CategoryFormErrors {
  alertExpiryDays?: string;
  alertMinQuantity?: string;
  defaultDurationMinutes?: string;
  depositCrc?: string;
  depositUsd?: string;
  name?: string;
  usageMetric?: string;
}

const MIN_VALID = 1;

const isBlankOrPositive = (rawValue: string): boolean =>
  rawValue.trim().length === 0 ||
  Number(rawValue) >= MIN_VALID;

/**
 * Mirrors the `check` constraints on `equipment_categories`
 * (`supabase/migrations/20260828000300_catalog.sql`) so a mistake lands
 * next to the field instead of as a raw database rejection — the database
 * is still what actually enforces every one of these (US-ADM-013 through
 * US-ADM-015, validaciones del catálogo).
 */
export const validateCategoryForm = (
  values: CategoryFormValues
): CategoryFormErrors => {
  const errors: CategoryFormErrors = {};

  if (!values.name.trim()) {
    errors.name = CATEGORY_FORM_SCREEN.ERROR.NAME_REQUIRED;
  }

  if (values.hasMotor && !values.usageMetric) {
    errors.usageMetric = CATEGORY_FORM_SCREEN.ERROR.GENERIC;
  }

  if (
    values.isReservable &&
    !values.defaultDurationMinutes.trim()
  ) {
    errors.defaultDurationMinutes =
      CATEGORY_FORM_SCREEN.ERROR.GENERIC;
  }

  if (!isBlankOrPositive(values.alertMinQuantity)) {
    errors.alertMinQuantity =
      CATEGORY_FORM_SCREEN.ERROR.GENERIC;
  }
  if (!isBlankOrPositive(values.alertExpiryDays)) {
    errors.alertExpiryDays =
      CATEGORY_FORM_SCREEN.ERROR.GENERIC;
  }
  if (!isBlankOrPositive(values.depositUsd)) {
    errors.depositUsd = CATEGORY_FORM_SCREEN.ERROR.GENERIC;
  }
  if (!isBlankOrPositive(values.depositCrc)) {
    errors.depositCrc = CATEGORY_FORM_SCREEN.ERROR.GENERIC;
  }

  return errors;
};

const toNullableNumber = (
  rawValue: string
): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

export interface CategoryWritePayload {
  alert_expiry_days: Nullable<number>;
  alert_min_quantity: Nullable<number>;
  can_be_damaged: boolean;
  consumes_fuel: boolean;
  default_duration_minutes: Nullable<number>;
  deposit_crc: Nullable<number>;
  deposit_usd: Nullable<number>;
  guide_only: boolean;
  has_condition_photos: boolean;
  group_name: Nullable<string>;
  has_motor: boolean;
  is_reservable: boolean;
  name: string;
  tracking_mode: TrackingMode;
  usage_metric: Nullable<UsageMetric>;
}

/**
 * Maps the form's string-based state to the shape the database accepts,
 * forcing every field the hybrid model ties together back into a
 * consistent null/value pair instead of trusting stale UI state: a
 * category that is not `by_unit` never carries condition photos
 * (`categories_photos_need_units`), one without a motor never carries a
 * usage metric, and one that is not reservable never carries a default
 * duration.
 */
export const buildCategoryPayload = (
  values: CategoryFormValues
): CategoryWritePayload => ({
  alert_expiry_days: toNullableNumber(
    values.alertExpiryDays
  ),
  alert_min_quantity: toNullableNumber(
    values.alertMinQuantity
  ),
  can_be_damaged: values.canBeDamaged,
  consumes_fuel: values.consumesFuel,
  default_duration_minutes: values.isReservable
    ? toNullableNumber(values.defaultDurationMinutes)
    : null,
  deposit_crc: toNullableNumber(values.depositCrc),
  deposit_usd: toNullableNumber(values.depositUsd),
  guide_only: values.guideOnly,
  has_condition_photos:
    values.trackingMode === TRACKING_MODE.BY_UNIT &&
    values.hasConditionPhotos,
  has_motor: values.hasMotor,
  group_name: values.groupName.trim() || null,
  is_reservable: values.isReservable,
  name: values.name.trim(),
  tracking_mode: values.trackingMode,
  usage_metric: values.hasMotor ? values.usageMetric : null,
});
