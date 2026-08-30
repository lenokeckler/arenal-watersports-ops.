"use client";

import { usePathname } from "next/navigation";
import { BOTTOM_NAV, STORE_SLICES } from "@/app/constants";
import { useAppSelector } from "@/app/store/hooks";
import { useSessionStore } from "@/app/components/session/hooks/useSessionStore";
import type { BottomNavViewModel } from "../models/BottomNavViewModel.interface";

/**
 * US-TAB-004/US-TAB-007: which icons show up depends on the active mode,
 * read from the same `workArea` Redux slice the mode switcher writes to —
 * this only decides what renders, never what a request is allowed to do.
 * That stays entirely with the database policies, which do not know this
 * hook exists.
 */
export const useBottomNavViewModel = (): BottomNavViewModel => {
  const pathname = usePathname();
  const { hasActiveUser } = useSessionStore();
  const { activeArea } = useAppSelector(
    (state) => state[STORE_SLICES.WORK_AREA]
  );

  if (!hasActiveUser || !activeArea) {
    return { isVisible: false, items: [] };
  }

  const items = BOTTOM_NAV.ITEMS.filter((item) =>
    (item.VISIBLE_IN as readonly string[]).includes(activeArea)
  ).map((item) => ({
    href: item.HREF,
    icon: item.ICON,
    id: item.ID,
    isActive: pathname === item.HREF || pathname.startsWith(`${item.HREF}/`),
    label: item.LABEL,
  }));

  return { isVisible: items.length > 0, items };
};
