"use client";

import { useState } from "react";
import {
  STRING,
  type ComboAudience,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { ComboDetail } from "@/app/utils/administracion/combos";
import {
  INITIAL_COMBO_FORM_VALUES,
  readComboPrice,
  type ComboFormValues,
} from "@/app/utils/administracion/comboValidation";
import type { ComboStringField } from "../models/ComboFormViewModel.interface";

const numberToField = (value: Nullable<number>): string =>
  value === null || value === undefined
    ? STRING.Empty
    : String(value);

const toInitialValues = (
  combo: Nullable<ComboDetail>
): ComboFormValues =>
  combo
    ? {
        audience: combo.audience,
        name: combo.name,
        price: numberToField(
          readComboPrice({
            audience: combo.audience,
            packagePriceCrc: combo.packagePriceCrc,
            packagePriceUsd: combo.packagePriceUsd,
          })
        ),
      }
    : INITIAL_COMBO_FORM_VALUES;

interface UseComboFieldsViewModelReturn {
  handleAudienceChange: (audience: ComboAudience) => void;
  handleFieldChange: (
    field: ComboStringField,
    value: string
  ) => void;
  values: ComboFormValues;
}

/** Owns the name/price field state (US-ADM-022, US-ADM-023). */
export const useComboFieldsViewModel = (
  combo: Nullable<ComboDetail>
): UseComboFieldsViewModelReturn => {
  const [values, setValues] = useState<ComboFormValues>(
    () => toInitialValues(combo)
  );

  const handleFieldChange = (
    field: ComboStringField,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAudienceChange = (
    audience: ComboAudience
  ): void => {
    setValues((current) => ({ ...current, audience }));
  };

  return {
    handleAudienceChange,
    handleFieldChange,
    values,
  };
};
