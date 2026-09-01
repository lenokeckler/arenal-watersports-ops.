import {
  MATERIAL_ICON_NAME,
  type MaterialIconName,
} from "@/app/components/icons/material-icon/constants";

/**
 * The two color themes `app/globals.css` defines (see
 * `docs/decisiones/tema-claro.md`): `DARK` is the app's fixed `@theme`
 * block, `LIGHT` is the second token set under `[data-theme="light"]`.
 */
export const THEME = {
  DARK: "dark",
  LIGHT: "light",
} as const;

export type Theme = (typeof THEME)[keyof typeof THEME];

/**
 * Dark stays the default (US requirement: nobody should open the app and
 * find it changed without asking) — see `app/globals.css` for where that
 * default actually lives (the un-attributed `@theme` block).
 */
export const DEFAULT_THEME: Theme = THEME.DARK;

/** The attribute `app/utils/theme/theme.ts` reads/writes on `<html>`. */
export const THEME_ATTRIBUTE = "data-theme";

/** The `localStorage` key the theme preference is saved under — device-only, never the account (see spec). */
export const THEME_STORAGE_KEY = "arenal-ops-theme";

export const THEME_OPTION = {
  [THEME.DARK]: {
    ICON: MATERIAL_ICON_NAME.DARK_MODE,
    LABEL: "Oscuro",
  },
  [THEME.LIGHT]: {
    ICON: MATERIAL_ICON_NAME.LIGHT_MODE,
    LABEL: "Claro",
  },
} satisfies Record<
  Theme,
  { ICON: MaterialIconName; LABEL: string }
>;
