/**
 * Ligature names from Material Symbols Outlined (loaded in `app/layout.tsx`).
 * Add a key here the first time a screen needs a new glyph instead of
 * writing the ligature string inline — see `MaterialIcon`.
 */
export const MATERIAL_ICON_NAME = {
  CHECK_CIRCLE: "check_circle",
  ERROR: "error",
  LOCK_RESET: "lock_reset",
  LOGIN: "login",
  RADIO_BUTTON_UNCHECKED: "radio_button_unchecked",
} as const;

export type MaterialIconName =
  (typeof MATERIAL_ICON_NAME)[keyof typeof MATERIAL_ICON_NAME];
