import type { WorkArea } from "@/app/constants";
import type { Nullable } from "@/app/types";

export interface WorkAreaSwitcherViewModel {
  activeArea: Nullable<WorkArea>;
  availableAreas: WorkArea[];
  handleLogout: () => void;
  handleSelectArea: (area: WorkArea) => void;
  isVisible: boolean;
  showModeButtons: boolean;
}
