import type { Nullable } from "@/app/types";
import {
  COMBO_AUDIENCE,
  COMBO_FORM_SCREEN,
  STRING,
  type ComboAudience,
} from "@/app/constants";

export interface ComboFormValues {
  audience: ComboAudience;
  name: string;
  price: string;
}

export interface ComboFormErrors {
  name?: string;
  price?: string;
}

/**
 * Un combo se vende en la moneda de su publico, y solo en esa: nacionales en
 * colones, extranjeros en dolares. Por eso el formulario tiene un unico campo
 * de precio — cual moneda es lo decide la seccion, no quien lo llena — y por
 * eso el precio es obligatorio: un combo sin precio no se puede vender, y
 * `combos_price_matches_audience` lo rechaza igual en la base.
 */
export const validateComboForm = (
  values: ComboFormValues
): ComboFormErrors => {
  const errors: ComboFormErrors = {};

  if (!values.name.trim()) {
    errors.name = COMBO_FORM_SCREEN.ERROR.NAME_REQUIRED;
  }

  if (!values.price.trim()) {
    errors.price = COMBO_FORM_SCREEN.ERROR.PRICE_REQUIRED;
  }

  return errors;
};

const toNullableNumber = (
  rawValue: string
): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

export interface ComboWritePayload {
  audience: ComboAudience;
  name: string;
  package_price_crc: Nullable<number>;
  package_price_usd: Nullable<number>;
}

export const buildComboPayload = (
  values: ComboFormValues
): ComboWritePayload => {
  const amount = toNullableNumber(values.price);
  const isNational =
    values.audience === COMBO_AUDIENCE.NATIONAL;

  return {
    audience: values.audience,
    name: values.name.trim(),
    package_price_crc: isNational ? amount : null,
    package_price_usd: isNational ? null : amount,
  };
};

export const INITIAL_COMBO_FORM_VALUES: ComboFormValues = {
  audience: COMBO_AUDIENCE.NATIONAL,
  name: STRING.Empty,
  price: STRING.Empty,
};

/** El precio que le corresponde a un combo segun su publico. */
export const readComboPrice = (combo: {
  audience: ComboAudience;
  packagePriceCrc: Nullable<number>;
  packagePriceUsd: Nullable<number>;
}): Nullable<number> =>
  combo.audience === COMBO_AUDIENCE.NATIONAL
    ? combo.packagePriceCrc
    : combo.packagePriceUsd;
