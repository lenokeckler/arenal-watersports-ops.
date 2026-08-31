import type { Nullable } from "@/app/types";
import type { MaintenanceFormFields } from "@/app/utils/operaciones/maintenanceFormValues";

export interface MachineMaintenanceViewModel {
  error: Nullable<string>;
  handleFieldChange: <
    Field extends keyof MaintenanceFormFields,
  >(
    field: Field,
    value: MaintenanceFormFields[Field]
  ) => void;
  handleSubmit: () => void;
  isBusy: boolean;
  values: MaintenanceFormFields;
}
