import {
  WORK_AREA_LABEL,
  WORK_MODE_SCREEN,
  type WorkArea,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import type { AppDrawerAreaOption } from "../models/AppDrawerAreaOption.interface";

/**
 * Reuses `WorkModeScreen.constants.ts`'s icons and labels (already the
 * source of truth for `/acceso/modo-de-trabajo`) so the drawer's switcher
 * never defines a second copy of either.
 */
export const buildAreaOptions = (
  availableAreas: WorkArea[],
  activeArea: Nullable<WorkArea>
): AppDrawerAreaOption[] =>
  availableAreas.map((area) => ({
    area,
    icon: WORK_MODE_SCREEN.CARD[area].ICON,
    isActive: area === activeArea,
    label: WORK_AREA_LABEL[area],
  }));
