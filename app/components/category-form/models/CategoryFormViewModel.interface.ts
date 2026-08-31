import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type { CategoryStatus } from "@/app/constants";
import type {
  CategoryFormErrors,
  CategoryFormValues,
} from "@/app/utils/administracion/categoryValidation";

export type CategoryStringField = Exclude<
  keyof CategoryFormValues,
  CategoryBooleanField
>;

export type CategoryBooleanField =
  | "canBeDamaged"
  | "consumesFuel"
  | "guideOnly"
  | "hasConditionPhotos"
  | "hasMotor"
  | "isReservable";

export interface CategoryFormViewModel {
  canDelete: boolean;
  errors: CategoryFormErrors;
  formError: Nullable<string>;
  handleDeactivate: () => void;
  handleDelete: () => void;
  handleFieldChange: (
    field: CategoryStringField,
    value: string
  ) => void;
  handleReactivate: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleToggleField: (
    field: CategoryBooleanField,
    checked: boolean
  ) => void;
  isBusy: boolean;
  isEditMode: boolean;
  isTrackingModeLocked: boolean;
  status: CategoryStatus;
  values: CategoryFormValues;
}
