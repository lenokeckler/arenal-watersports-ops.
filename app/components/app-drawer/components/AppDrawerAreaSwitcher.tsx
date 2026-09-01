import type { JSX } from "react";
import {
  APP_DRAWER_SCREEN,
  BUTTON,
  BUTTON_TYPES,
  type WorkArea,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { AppDrawerAreaOption } from "../models/AppDrawerAreaOption.interface";

interface AppDrawerAreaSwitcherProps {
  onSelect: (area: WorkArea) => void;
  options: AppDrawerAreaOption[];
}

/**
 * The area switcher, now with a visible label per option — the bug being
 * fixed here is that the old compact switcher only carried an
 * `aria-label`, so a mobile screen never showed which mode was active.
 * Only rendered by `AppDrawer` when the account has more than one area.
 */
const AppDrawerAreaSwitcher = ({
  onSelect,
  options,
}: AppDrawerAreaSwitcherProps): JSX.Element => (
  <div className="mb-md flex flex-col gap-2 border-b border-white/5 pb-md">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {APP_DRAWER_SCREEN.AREA_SWITCHER_TITLE}
    </span>
    {options.map((option) => (
      <Button
        key={option.area}
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        aria-pressed={option.isActive}
        onClick={() => onSelect(option.area)}
        className={`flex min-h-12 items-center gap-3 rounded-lg px-sm transition-colors ${
          option.isActive
            ? "bg-primary/20 text-primary"
            : "text-on-surface-variant hover:text-primary"
        }`}
      >
        <MaterialIcon
          name={option.icon}
          className="!text-[20px]"
        />
        <span className="font-body-base text-body-base">
          {option.label}
        </span>
      </Button>
    ))}
  </div>
);

export default AppDrawerAreaSwitcher;
