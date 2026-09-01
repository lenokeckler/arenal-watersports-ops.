"use client";

import { usePathname } from "next/navigation";
import {
  BOTTOM_NAV,
  BOTTOM_NAV_SECTION,
  STORE_SLICES,
} from "@/app/constants";
import {
  useAppDispatch,
  useAppSelector,
} from "@/app/store/hooks";
import { appDrawerActions } from "@/app/store";
import { useSessionStore } from "@/app/components/session/hooks/useSessionStore";
import { getBottomNavItemsForArea } from "@/app/utils/tablero/bottomNavItems";
import type { BottomNavViewModel } from "../models/BottomNavViewModel.interface";

/**
 * US-TAB-004/US-TAB-007: which icons show up depends on the active mode,
 * read from the same `workArea` Redux slice the drawer writes to — this
 * only decides what renders, never what a request is allowed to do. That
 * stays entirely with the database policies, which do not know this hook
 * exists. `handleOpenMenu` opens `AppDrawer` through the shared
 * `appDrawer` slice — see `BOTTOM_NAV.HIDDEN_ROUTE_PREFIXES` for why this
 * bar (and its "Menú" trigger) does not render on every route.
 */
export const useBottomNavViewModel =
  (): BottomNavViewModel => {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { hasActiveUser } = useSessionStore();
    const { activeArea } = useAppSelector(
      (state) => state[STORE_SLICES.WORK_AREA]
    );

    const handleOpenMenu = (): void => {
      dispatch(appDrawerActions.setIsOpen(true));
    };

    const isHiddenRoute =
      BOTTOM_NAV.HIDDEN_ROUTE_PREFIXES.some((prefix) =>
        pathname.startsWith(prefix)
      );

    if (!hasActiveUser || !activeArea || isHiddenRoute) {
      return {
        handleOpenMenu,
        isVisible: false,
        items: [],
      };
    }

    const items = getBottomNavItemsForArea(
      activeArea,
      BOTTOM_NAV_SECTION.PRIMARY,
      pathname
    );

    return {
      handleOpenMenu,
      isVisible: items.length > 0,
      items,
    };
  };
