"use client";

import { usePathname } from "next/navigation";
import {
  BOTTOM_NAV_SECTION,
  STORE_SLICES,
  STRING,
  WORK_AREA_LABEL,
} from "@/app/constants";
import {
  useAppDispatch,
  useAppSelector,
} from "@/app/store/hooks";
import { appDrawerActions } from "@/app/store";
import { useSessionStore } from "@/app/components/session/hooks/useSessionStore";
import { getBottomNavItemsForArea } from "@/app/utils/tablero/bottomNavItems";
import { useAppDrawerIdentity } from "./useAppDrawerIdentity";
import { useLogoutConfirmation } from "./useLogoutConfirmation";
import { useDrawerFocusTrap } from "./useDrawerFocusTrap";
import { useThemePreference } from "./useThemePreference";
import { buildAreaOptions } from "../utils/areaOptions";
import { buildThemeOptions } from "../utils/themeOptions";
import type { AppDrawerViewModel } from "../models/AppDrawerViewModel.interface";

/**
 * Orchestrates `AppDrawer` (see `specs/SPEC.md`): identity + area switch
 * (ported from the deleted `WorkAreaSwitcher`), the secondary navigation
 * the bottom bar has no room for, and a two-step logout — composed from
 * smaller single-purpose hooks (component-architecture's Facade pattern)
 * instead of one god hook.
 */
export const useAppDrawerViewModel =
  (): AppDrawerViewModel => {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { hasActiveUser } = useSessionStore();
    const { isOpen: isOpenInStore } = useAppSelector(
      (state) => state[STORE_SLICES.APP_DRAWER]
    );
    const isOpen = isOpenInStore && hasActiveUser;

    const dispatchClose = (): void => {
      dispatch(appDrawerActions.setIsOpen(false));
    };

    const {
      activeArea,
      availableAreas,
      fullName,
      handleSelectArea,
      username,
    } = useAppDrawerIdentity();
    const {
      handleConfirmLogout,
      handleRequestLogout,
      isConfirmingLogout,
      resetConfirmation,
    } = useLogoutConfirmation({
      onLoggedOut: dispatchClose,
    });

    // Every way to close the panel — backdrop, header close, Escape, a nav
    // link, or a completed logout — funnels through this one handler, so the
    // logout confirmation always resets with it instead of needing its own
    // effect to mirror `isOpen`.
    const handleClose = (): void => {
      dispatchClose();
      resetConfirmation();
    };

    const { panelRef } = useDrawerFocusTrap({
      isOpen,
      onClose: handleClose,
    });
    const { handleSelectTheme, theme } =
      useThemePreference();

    const secondaryNavItems = getBottomNavItemsForArea(
      activeArea,
      BOTTOM_NAV_SECTION.SECONDARY,
      pathname
    );

    return {
      activeAreaLabel: activeArea
        ? WORK_AREA_LABEL[activeArea]
        : STRING.Empty,
      areaOptions: buildAreaOptions(
        availableAreas,
        activeArea
      ),
      fullName,
      handleClose,
      handleConfirmLogout,
      handleRequestLogout,
      handleSelectArea,
      handleSelectTheme,
      isConfirmingLogout,
      isOpen,
      panelRef,
      secondaryNavItems,
      themeOptions: buildThemeOptions(theme),
      username,
    };
  };
