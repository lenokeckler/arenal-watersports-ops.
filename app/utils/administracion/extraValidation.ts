import type { Nullable } from "@/app/types";
import { EXTRA_FORM_SCREEN, STRING } from "@/app/constants";

export interface ExtraFormValues {
  compatibleUnitIds: string[];
  name: string;
  occupiesCategoryId: string;
  occupiesQuantity: string;
  priceCrc: string;
  priceUsd: string;
}

export interface ExtraFormErrors {
  name?: string;
  occupiesQuantity?: string;
}

const MIN_VALID = 1;

const isBlankOrPositive = (rawValue: string): boolean =>
  rawValue.trim().length === 0 || Number(rawValue) >= MIN_VALID;

/**
 * Mirrors `extras_occupies_shape` (`supabase/migrations/20260828000600_offerings.sql`):
 * a category and a quantity travel together or not at all (US-ADM-021).
 */
export const validateExtraForm = (
  values: ExtraFormValues
): ExtraFormErrors => {
  const errors: ExtraFormErrors = {};

  if (!values.name.trim()) {
    errors.name = EXTRA_FORM_SCREEN.ERROR.NAME_REQUIRED;
  }

  if (values.occupiesCategoryId && !values.occupiesQuantity.trim()) {
    errors.occupiesQuantity =
      EXTRA_FORM_SCREEN.ERROR.OCCUPIES_QUANTITY_REQUIRED;
  } else if (!isBlankOrPositive(values.occupiesQuantity)) {
    errors.occupiesQuantity =
      EXTRA_FORM_SCREEN.ERROR.OCCUPIES_QUANTITY_REQUIRED;
  }

  return errors;
};

const toNullableNumber = (rawValue: string): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

export interface ExtraWritePayload {
  name: string;
  occupies_category_id: Nullable<string>;
  occupies_quantity: Nullable<number>;
  price_crc: Nullable<number>;
  price_usd: Nullable<number>;
}

/**
 * An extra with no category picked never carries a quantity either — the
 * pair moves together, matching `extras_occupies_shape`.
 */
export const buildExtraPayload = (
  values: ExtraFormValues
): ExtraWritePayload => ({
  name: values.name.trim(),
  occupies_category_id: values.occupiesCategoryId || null,
  occupies_quantity: values.occupiesCategoryId
    ? toNullableNumber(values.occupiesQuantity)
    : null,
  price_crc: toNullableNumber(values.priceCrc),
  price_usd: toNullableNumber(values.priceUsd),
});

export const INITIAL_EXTRA_FORM_VALUES: ExtraFormValues = {
  compatibleUnitIds: [],
  name: STRING.Empty,
  occupiesCategoryId: STRING.Empty,
  occupiesQuantity: STRING.Empty,
  priceCrc: STRING.Empty,
  priceUsd: STRING.Empty,
};
