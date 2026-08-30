import type { FormEvent } from "react";
import type { Nullable } from "@/app/types";
import type { StockMovementRow } from "@/app/utils/administracion/stock";
import type {
  StockFormErrors,
  StockFormValues,
} from "@/app/utils/administracion/stockValidation";

export type { StockFormErrors, StockFormValues };

export interface StockFormViewModel {
  errors: StockFormErrors;
  formError: Nullable<string>;
  handleFieldChange: (
    field: keyof StockFormValues,
    value: string
  ) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
  movements: StockMovementRow[];
  values: StockFormValues;
}
