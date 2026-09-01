import type { WorkArea } from "@/app/constants";
import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";

export interface AppDrawerAreaOption {
  area: WorkArea;
  icon: MaterialIconName;
  isActive: boolean;
  label: string;
}
