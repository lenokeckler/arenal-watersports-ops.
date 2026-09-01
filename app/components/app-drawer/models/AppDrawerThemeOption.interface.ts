import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";
import type { Theme } from "@/app/constants";

export interface AppDrawerThemeOption {
  icon: MaterialIconName;
  isActive: boolean;
  label: string;
  theme: Theme;
}
