import {
  THEME,
  THEME_OPTION,
  type Theme,
} from "@/app/constants";
import type { AppDrawerThemeOption } from "../models/AppDrawerThemeOption.interface";

/**
 * Both theme states, always dark-then-light, with the active one flagged —
 * mirrors `buildAreaOptions`.
 */
export const buildThemeOptions = (
  activeTheme: Theme
): AppDrawerThemeOption[] =>
  [THEME.DARK, THEME.LIGHT].map((theme) => ({
    icon: THEME_OPTION[theme].ICON,
    isActive: theme === activeTheme,
    label: THEME_OPTION[theme].LABEL,
    theme,
  }));
