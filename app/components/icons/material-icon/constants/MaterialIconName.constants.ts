/**
 * Ligature names from Material Symbols Outlined (loaded in `app/layout.tsx`).
 * Add a key here the first time a screen needs a new glyph instead of
 * writing the ligature string inline — see `MaterialIcon`.
 */
export const MATERIAL_ICON_NAME = {
  ADMIN_PANEL_SETTINGS: "admin_panel_settings",
  ANCHOR: "anchor",
  ARROW_FORWARD: "arrow_forward",
  CHECK_CIRCLE: "check_circle",
  ERROR: "error",
  EVENT_AVAILABLE: "event_available",
  LOCK: "lock",
  LOCK_RESET: "lock_reset",
  LOGIN: "login",
  LOGOUT: "logout",
  MAIL: "mail",
  PERSON: "person",
  RADIO_BUTTON_UNCHECKED: "radio_button_unchecked",
  SWAP_HORIZ: "swap_horiz",
  VISIBILITY: "visibility",
  VISIBILITY_OFF: "visibility_off",
  WAVES: "waves",
} as const;

export type MaterialIconName =
  (typeof MATERIAL_ICON_NAME)[keyof typeof MATERIAL_ICON_NAME];
