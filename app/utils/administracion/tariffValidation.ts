import type { Nullable } from "@/app/types";
import { RATE_FORM_SCREEN, STRING } from "@/app/constants";

export interface TariffAmountValues {
  amountCrc: string;
  amountUsd: string;
}

export interface TariffFormValues extends TariffAmountValues {
  /** `"<categoryId>:<type>"`, only used to create a new tariff. */
  selectedOption: string;
}

export interface TariffFormErrors {
  amount?: string;
  selectedOption?: string;
}

/** Mirrors `tariffs_has_some_price`: at least one currency must be set. */
export const validateTariffAmounts = (
  values: TariffAmountValues
): TariffFormErrors => {
  const errors: TariffFormErrors = {};

  if (
    !values.amountUsd.trim() &&
    !values.amountCrc.trim()
  ) {
    errors.amount = RATE_FORM_SCREEN.ERROR.AMOUNT_REQUIRED;
  }

  return errors;
};

export const validateNewTariffForm = (
  values: TariffFormValues
): TariffFormErrors => {
  const errors = validateTariffAmounts(values);

  if (!values.selectedOption) {
    errors.selectedOption = RATE_FORM_SCREEN.ERROR.GENERIC;
  }

  return errors;
};

const toNullableNumber = (
  rawValue: string
): Nullable<number> =>
  rawValue.trim() ? Number(rawValue) : null;

export interface TariffAmountPayload {
  amount_crc: Nullable<number>;
  amount_usd: Nullable<number>;
}

export const buildTariffAmountPayload = (
  values: TariffAmountValues
): TariffAmountPayload => ({
  amount_crc: toNullableNumber(values.amountCrc),
  amount_usd: toNullableNumber(values.amountUsd),
});

export const INITIAL_TARIFF_FORM_VALUES: TariffFormValues =
  {
    amountCrc: STRING.Empty,
    amountUsd: STRING.Empty,
    selectedOption: STRING.Empty,
  };
