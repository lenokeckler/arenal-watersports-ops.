"use client";

import { useState } from "react";
import { STRING } from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { ComboDetail } from "@/app/utils/administracion/combos";
import {
  INITIAL_COMBO_FORM_VALUES,
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
        name: combo.name,
        packagePriceCrc: numberToField(
          combo.packagePriceCrc
        ),
        packagePriceUsd: numberToField(
          combo.packagePriceUsd
        ),
      }
    : INITIAL_COMBO_FORM_VALUES;

interface UseComboFieldsViewModelReturn {
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

  return { handleFieldChange, values };
};
