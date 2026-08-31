"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MATERIAL_ICON_NAME,
  WORK_AREA_LABEL,
  WORK_MODE_SCREEN,
} from "@/app/constants";
import Button from "../button/Button";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import { useWorkAreaSwitcherViewModel } from "./hooks/useWorkAreaSwitcherViewModel";

/**
 * Always-visible control (section 8/9 of the access module design):
 * switching the work mode never requires signing out (US-ACC-011), and
 * logout must be reachable from any screen (US-ACC-008). Mounted once in
 * the root layout so both hold regardless of which screen is on top.
 * Renders nothing without an active session — the login and recovery
 * screens never show it. Fixed in a corner instead of inline in a header,
 * since this module owns no shared app header yet; large enough icon
 * buttons (`min-h-12 min-w-12`) to stay a real tap target on a narrow
 * screen with wet hands.
 */
const WorkAreaSwitcher = (): JSX.Element | null => {
  const {
    activeArea,
    availableAreas,
    handleLogout,
    handleSelectArea,
    isVisible,
    showModeButtons,
  } = useWorkAreaSwitcherViewModel();

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed right-margin-mobile top-margin-mobile z-40 flex items-center gap-2 rounded-full border border-white/10 bg-surface-container/80 p-1 shadow-lg backdrop-blur-md">
      {showModeButtons &&
        availableAreas.map((area) => {
          const isActive = area === activeArea;

          return (
            <Button
              key={area}
              type={BUTTON_TYPES.BUTTON}
              variant={BUTTON.BASE}
              aria-label={WORK_MODE_SCREEN.SWITCH_TO_ARIA(
                WORK_AREA_LABEL[area]
              )}
              aria-pressed={isActive}
              onClick={() => handleSelectArea(area)}
              className={`flex min-h-12 min-w-12 items-center justify-center rounded-full transition-colors ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <MaterialIcon
                name={WORK_MODE_SCREEN.CARD[area].ICON}
                className="!text-[20px]"
              />
            </Button>
          );
        })}

      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        aria-label={WORK_MODE_SCREEN.LOGOUT}
        onClick={handleLogout}
        className="flex min-h-12 min-w-12 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-error"
      >
        <MaterialIcon
          name={MATERIAL_ICON_NAME.LOGOUT}
          className="!text-[20px]"
        />
      </Button>
    </div>
  );
};

export default WorkAreaSwitcher;
