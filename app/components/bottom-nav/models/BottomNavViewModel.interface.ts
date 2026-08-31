import type { BottomNavItemId } from "@/app/constants";
import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";

export interface BottomNavVisibleItem {
  href: string;
  icon: MaterialIconName;
  id: BottomNavItemId;
  isActive: boolean;
  label: string;
}

export interface BottomNavViewModel {
  isVisible: boolean;
  items: BottomNavVisibleItem[];
}
