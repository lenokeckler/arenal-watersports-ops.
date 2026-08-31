"use client";

import { useState } from "react";
import { STRING, TRACKING_MODE } from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { CategoryDetail } from "@/app/utils/administracion/categories";
import type { CategoryFormValues } from "@/app/utils/administracion/categoryValidation";
import type {
  CategoryBooleanField,
  CategoryStringField,
} from "../models/CategoryFormViewModel.interface";

const numberToField = (value: Nullable<number>): string =>
  value === null || value === undefined
    ? STRING.Empty
    : String(value);

const toInitialValues = (
  category: Nullable<CategoryDetail>
): CategoryFormValues => ({
  alertExpiryDays: numberToField(
    category?.alertExpiryDays ?? null
  ),
  alertMinQuantity: numberToField(
    category?.alertMinQuantity ?? null
  ),
  canBeDamaged: category?.canBeDamaged ?? true,
  consumesFuel: category?.consumesFuel ?? false,
  defaultDurationMinutes: numberToField(
    category?.defaultDurationMinutes ?? null
  ),
  depositCrc: numberToField(category?.depositCrc ?? null),
  depositUsd: numberToField(category?.depositUsd ?? null),
  guideOnly: category?.guideOnly ?? false,
  hasConditionPhotos: category?.hasConditionPhotos ?? false,
  hasMotor: category?.hasMotor ?? false,
  groupName: category?.groupName ?? STRING.Empty,
  isReservable: category?.isReservable ?? false,
  name: category?.name ?? STRING.Empty,
  trackingMode:
    category?.trackingMode ?? TRACKING_MODE.BY_UNIT,
  usageMetric: category?.usageMetric ?? null,
});

interface UseCategoryFieldsViewModelReturn {
  handleFieldChange: (
    field: CategoryStringField,
    value: string
  ) => void;
  handleToggleField: (
    field: CategoryBooleanField,
    checked: boolean
  ) => void;
  values: CategoryFormValues;
}

/**
 * Owns the form's field state (US-ADM-013 through US-ADM-015): one generic
 * setter for text/select fields and one for the behavior toggles, each
 * clearing the values the hybrid model ties together — turning off the
 * motor clears the usage metric, and moving away from `by_unit` clears
 * condition photos (`categories_photos_need_units`) — instead of leaving
 * stale state `buildCategoryPayload` would otherwise have to guess about.
 */
export const useCategoryFieldsViewModel = (
  category: Nullable<CategoryDetail>
): UseCategoryFieldsViewModelReturn => {
  const [values, setValues] = useState<CategoryFormValues>(
    () => toInitialValues(category)
  );

  const handleFieldChange = (
    field: CategoryStringField,
    value: string
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "trackingMode" &&
      value !== TRACKING_MODE.BY_UNIT
        ? { hasConditionPhotos: false }
        : {}),
    }));
  };

  const handleToggleField = (
    field: CategoryBooleanField,
    checked: boolean
  ): void => {
    setValues((current) => ({
      ...current,
      [field]: checked,
      ...(field === "hasMotor" && !checked
        ? { usageMetric: null }
        : {}),
    }));
  };

  return { handleFieldChange, handleToggleField, values };
};
