"use client";

import { useState } from "react";
import { STRING } from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { ExtraDetail } from "@/app/utils/administracion/extras";
import { INITIAL_EXTRA_FORM_VALUES } from "@/app/utils/administracion/extraValidation";
import type { ExtraFormValues } from "@/app/utils/administracion/extraValidation";
import type { ExtraStringField } from "../models/ExtraFormViewModel.interface";

const numberToField = (value: Nullable<number>): string =>
  value === null || value === undefined ? STRING.Empty : String(value);

const toInitialValues = (
  extra: Nullable<ExtraDetail>
): ExtraFormValues =>
  extra
    ? {
        compatibleUnitIds: extra.compatibleUnitIds,
        name: extra.name,
        occupiesCategoryId: extra.occupiesCategoryId ?? STRING.Empty,
        occupiesQuantity: numberToField(extra.occupiesQuantity),
        priceCrc: numberToField(extra.priceCrc),
        priceUsd: numberToField(extra.priceUsd),
      }
    : INITIAL_EXTRA_FORM_VALUES;

interface UseExtraFieldsViewModelReturn {
  handleFieldChange: (field: ExtraStringField, value: string) => void;
  values: ExtraFormValues;
}

/**
 * Owns the form's text/select field state (US-ADM-019, US-ADM-021).
 * Clearing the occupied category also clears its quantity, mirroring
 * `extras_occupies_shape`: the pair moves together.
 */
export const useExtraFieldsViewModel = (
  extra: Nullable<ExtraDetail>
): UseExtraFieldsViewModelReturn => {
  const [values, setValues] = useState<ExtraFormValues>(() =>
    toInitialValues(extra)
  );

  const handleFieldChange = (
    field: ExtraStringField,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "occupiesCategoryId" && !value
        ? { occupiesQuantity: STRING.Empty }
        : {}),
    }));
  };

  return { handleFieldChange, values };
};
