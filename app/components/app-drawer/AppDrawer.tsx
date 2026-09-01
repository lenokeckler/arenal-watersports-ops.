"use client";

import type { JSX } from "react";
import { APP_DRAWER_SCREEN } from "@/app/constants";
import { useAppDrawerViewModel } from "./hooks/useAppDrawerViewModel";
import AppDrawerHeader from "./components/AppDrawerHeader";
import AppDrawerIdentity from "./components/AppDrawerIdentity";
import AppDrawerAreaSwitcher from "./components/AppDrawerAreaSwitcher";
import AppDrawerThemeSwitcher from "./components/AppDrawerThemeSwitcher";
import AppDrawerNav from "./components/AppDrawerNav";
import AppDrawerLogoutButton from "./components/AppDrawerLogoutButton";

/**
 * The left-side navigation panel (see `specs/SPEC.md`): identity, area
 * switch, secondary navigation, profile and logout — everything the
 * compact `WorkAreaSwitcher` used to own plus what the bottom bar has no
 * room for. Mounted once in the root layout, like `BottomNav`; renders
 * nothing without an active session or while closed. Chrome mirrors
 * `ActionSheet` (overlay + backdrop button + `backdrop-blur-xl` panel),
 * opening from the left instead of the bottom.
 */
const AppDrawer = (): JSX.Element | null => {
  const {
    activeAreaLabel,
    areaOptions,
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
    themeOptions,
    username,
  } = useAppDrawerViewModel();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <button
        type="button"
        aria-label={APP_DRAWER_SCREEN.CLOSE_ARIA}
        onClick={handleClose}
        className="absolute inset-0 bg-surface/70 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        className="relative z-10 flex h-full w-[85%] max-w-[22rem] flex-col border-r border-outline-variant bg-surface-container-lowest/95 backdrop-blur-xl"
      >
        <AppDrawerHeader onClose={handleClose} />
        <div className="flex-1 overflow-y-auto px-margin-mobile py-md">
          <AppDrawerIdentity
            activeAreaLabel={activeAreaLabel}
            fullName={fullName}
            username={username}
          />
          {areaOptions.length > 1 && (
            <AppDrawerAreaSwitcher
              options={areaOptions}
              onSelect={handleSelectArea}
            />
          )}
          <AppDrawerThemeSwitcher
            options={themeOptions}
            onSelect={handleSelectTheme}
          />
          <AppDrawerNav
            items={secondaryNavItems}
            onNavigate={handleClose}
          />
        </div>
        <AppDrawerLogoutButton
          isConfirming={isConfirmingLogout}
          onConfirm={handleConfirmLogout}
          onRequest={handleRequestLogout}
        />
      </div>
    </div>
  );
};

export default AppDrawer;
