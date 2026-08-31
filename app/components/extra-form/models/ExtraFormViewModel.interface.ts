import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type { CategoryStatus } from "@/app/constants";
import type {
  ExtraFormErrors,
  ExtraFormValues,
} from "@/app/utils/administracion/extraValidation";

export type ExtraStringField = Exclude<
  keyof ExtraFormValues,
  "compatibleUnitIds"
>;

export interface ExtraFormViewModel {
  canDelete: boolean;
  errors: ExtraFormErrors;
  formError: Nullable<string>;
  handleDeactivate: () => void;
  handleDelete: () => void;
  handleFieldChange: (
    field: ExtraStringField,
    value: string
  ) => void;
  handleReactivate: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleToggleUnit: (unitId: string, isCompatible: boolean) => void;
  isBusy: boolean;
  isEditMode: boolean;
  status: CategoryStatus;
  values: ExtraFormValues;
}
