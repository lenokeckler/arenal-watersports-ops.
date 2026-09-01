import type { JSX } from "react";
import {
  APP_DRAWER_SCREEN,
  BUTTON,
  BUTTON_TYPES,
  type Theme,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { AppDrawerThemeOption } from "../models/AppDrawerThemeOption.interface";

interface AppDrawerThemeSwitcherProps {
  onSelect: (theme: Theme) => void;
  options: AppDrawerThemeOption[];
}

/**
 * The device-only light/dark preference (US requirement — see
 * `docs/decisiones/tema-claro.md`): same look as `AppDrawerAreaSwitcher`,
 * a single row of two buttons instead of a list, since there are always
 * exactly two states (component-architecture §5 local mini).
 */
const AppDrawerThemeSwitcher = ({
  onSelect,
  options,
}: AppDrawerThemeSwitcherProps): JSX.Element => (
  <div className="mb-md flex flex-col gap-2 border-b border-outline-variant/50 pb-md">
    <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
      {APP_DRAWER_SCREEN.PREFERENCES_TITLE}
    </span>
    <div className="flex gap-sm">
      {options.map((option) => (
        <Button
          key={option.theme}
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          aria-pressed={option.isActive}
          onClick={() => onSelect(option.theme)}
          className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-sm transition-colors ${
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
  </div>
);

export default AppDrawerThemeSwitcher;
