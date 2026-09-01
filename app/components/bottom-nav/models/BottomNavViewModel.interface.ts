import type { BottomNavAreaItem } from "@/app/utils/tablero/bottomNavItems";

export interface BottomNavViewModel {
  handleOpenMenu: () => void;
  isVisible: boolean;
  items: BottomNavAreaItem[];
}
