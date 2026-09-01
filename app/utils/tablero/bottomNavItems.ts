import {
  BOTTOM_NAV,
  type BottomNavItemId,
  type BottomNavSection,
  type WorkArea,
} from "@/app/constants";
import type { MaterialIconName } from "@/app/components/icons/material-icon/constants";
import type { Nullable } from "@/app/types";

export interface BottomNavAreaItem {
  href: string;
  icon: MaterialIconName;
  id: BottomNavItemId;
  isActive: boolean;
  label: string;
}

/**
 * US-TAB-004 through US-TAB-007: the one place that reads
 * `BOTTOM_NAV.ITEMS`, so `BottomNav` (primary bar) and `AppDrawer`
 * (secondary navigation) never keep two separate lists of the same
 * screens — each just asks for its own section.
 */
export const getBottomNavItemsForArea = (
  activeArea: Nullable<WorkArea>,
  section: BottomNavSection,
  pathname: string
): BottomNavAreaItem[] => {
  if (!activeArea) {
    return [];
  }

  return BOTTOM_NAV.ITEMS.filter((item) => {
    const sectionForArea = (
      item.SECTION_BY_AREA as Partial<
        Record<WorkArea, BottomNavSection>
      >
    )[activeArea];
    return sectionForArea === section;
  }).map((item) => ({
    href: item.HREF,
    icon: item.ICON,
    id: item.ID,
    isActive:
      pathname === item.HREF ||
      pathname.startsWith(`${item.HREF}/`),
    label: item.LABEL,
  }));
};
