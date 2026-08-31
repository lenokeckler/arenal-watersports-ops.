import type { ComboAudience } from "@/app/constants";
import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type { CategoryStatus } from "@/app/constants";
import type {
  ComboFormErrors,
  ComboFormValues,
} from "@/app/utils/administracion/comboValidation";
import type { ComboItemRow } from "@/app/utils/administracion/combos";

export type ComboStringField = keyof ComboFormValues;

export interface ComboFormViewModel {
  canDelete: boolean;
  errors: ComboFormErrors;
  formError: Nullable<string>;
  handleAddItem: (
    categoryId: string,
    quantity: number
  ) => void;
  handleDeactivate: () => void;
  handleDelete: () => void;
  handleAudienceChange: (audience: ComboAudience) => void;
  handleFieldChange: (
    field: ComboStringField,
    value: string
  ) => void;
  handleReactivate: () => void;
  handleRemoveItem: (categoryId: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleUpdateItemQuantity: (
    categoryId: string,
    quantity: number
  ) => void;
  isBusy: boolean;
  isEditMode: boolean;
  items: ComboItemRow[];
  itemsError: Nullable<string>;
  status: CategoryStatus;
  values: ComboFormValues;
}
