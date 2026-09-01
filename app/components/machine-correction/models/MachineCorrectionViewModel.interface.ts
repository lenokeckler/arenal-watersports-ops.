import type { Nullable } from "@/app/types";
import type { UnitStatus } from "@/app/constants";

export interface MachineCorrectionFormValues {
  fuelLevel: string;
  fuelMax: string;
  impactCount: string;
  status: Nullable<UnitStatus>;
  usageTotal: string;
}

export interface MachineCorrectionViewModel {
  error: Nullable<string>;
  handleFieldChange: <
    Field extends keyof MachineCorrectionFormValues,
  >(
    field: Field,
    value: MachineCorrectionFormValues[Field]
  ) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  values: MachineCorrectionFormValues;
}
