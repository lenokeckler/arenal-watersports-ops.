import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type {
  TariffFormErrors,
  TariffFormValues,
} from "@/app/utils/administracion/tariffValidation";

export interface RateFormViewModel {
  errors: TariffFormErrors;
  formError: Nullable<string>;
  handleFieldChange: (
    field: keyof TariffFormValues,
    value: string
  ) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
  isEditMode: boolean;
  values: TariffFormValues;
}
