import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type {
  UnitFormErrors,
  UnitFormValues,
} from "@/app/utils/administracion/unitValidation";

export type { UnitFormErrors, UnitFormValues };

export interface UnitFormViewModel {
  errors: UnitFormErrors;
  formError: Nullable<string>;
  handleDecommission: () => void;
  handleFieldChange: (
    field: keyof UnitFormValues,
    value: string
  ) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
  isDecommissioned: boolean;
  isEditMode: boolean;
  values: UnitFormValues;
}
