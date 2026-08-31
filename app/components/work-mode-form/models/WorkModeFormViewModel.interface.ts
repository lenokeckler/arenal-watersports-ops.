import type { WorkArea } from "@/app/constants";
import type { Nullable } from "@/app/types";

export interface WorkModeFormViewModel {
  errorMessage: Nullable<string>;
  handleLogout: () => void;
  handleSelectArea: (area: WorkArea) => void;
  isSubmitting: boolean;
  selectedArea: Nullable<WorkArea>;
}
