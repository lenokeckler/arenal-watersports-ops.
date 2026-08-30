import type { Nullable } from "@/app/types";
import { COMBO_FORM_SCREEN, STRING } from "@/app/constants";

export interface ComboFormValues {
  name: string;
  packagePriceCrc: string;
  packagePriceUsd: string;
}

export interface ComboFormErrors {
  name?: string;
}

export const validateComboForm = (
  values: ComboFormValues
): ComboFormErrors => {
  const errors: ComboFormErrors = {};

  if (!values.name.trim()) {
    errors.name = COMBO_FORM_SCREEN.ERROR.NAME_REQUIRED;
  }

  return errors;
};

const toNullableNumber = (
  rawValue: string
): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

export interface ComboWritePayload {
  name: string;
  package_price_crc: Nullable<number>;
  package_price_usd: Nullable<number>;
}

export const buildComboPayload = (
  values: ComboFormValues
): ComboWritePayload => ({
  name: values.name.trim(),
  package_price_crc: toNullableNumber(
    values.packagePriceCrc
  ),
  package_price_usd: toNullableNumber(
    values.packagePriceUsd
  ),
});

export const INITIAL_COMBO_FORM_VALUES: ComboFormValues = {
  name: STRING.Empty,
  packagePriceCrc: STRING.Empty,
  packagePriceUsd: STRING.Empty,
};
