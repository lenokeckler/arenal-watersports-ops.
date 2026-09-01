import type { RefObject } from "react";
import type { Theme, WorkArea } from "@/app/constants";
import type { BottomNavAreaItem } from "@/app/utils/tablero/bottomNavItems";
import type { AppDrawerAreaOption } from "./AppDrawerAreaOption.interface";
import type { AppDrawerThemeOption } from "./AppDrawerThemeOption.interface";

export interface AppDrawerViewModel {
  activeAreaLabel: string;
  areaOptions: AppDrawerAreaOption[];
  fullName: string;
  handleClose: () => void;
  handleConfirmLogout: () => void;
  handleRequestLogout: () => void;
  handleSelectArea: (area: WorkArea) => void;
  handleSelectTheme: (theme: Theme) => void;
  isConfirmingLogout: boolean;
  isOpen: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  secondaryNavItems: BottomNavAreaItem[];
  themeOptions: AppDrawerThemeOption[];
  username: string;
}
