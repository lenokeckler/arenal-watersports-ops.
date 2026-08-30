/**
 * Ligature names from Material Symbols Outlined (loaded in `app/layout.tsx`).
 * Add a key here the first time a screen needs a new glyph instead of
 * writing the ligature string inline — see `MaterialIcon`.
 */
export const MATERIAL_ICON_NAME = {
  ADMIN_PANEL_SETTINGS: "admin_panel_settings",
  ANCHOR: "anchor",
  ARROW_BACK: "arrow_back",
  ARROW_FORWARD: "arrow_forward",
  ATTACH_MONEY: "attach_money",
  BLOCK: "block",
  BUILD: "build",
  CALENDAR_MONTH: "calendar_month",
  CHECK_CIRCLE: "check_circle",
  CHEVRON_RIGHT: "chevron_right",
  DASHBOARD: "dashboard",
  DIRECTIONS_BOAT: "directions_boat",
  ERROR: "error",
  EVENT_AVAILABLE: "event_available",
  FILTER_LIST: "filter_list",
  GROUP: "group",
  HANDYMAN: "handyman",
  HISTORY: "history",
  INFO: "info",
  INVENTORY_2: "inventory_2",
  KAYAKING: "kayaking",
  LOCAL_GAS_STATION: "local_gas_station",
  LOCK: "lock",
  LOCK_RESET: "lock_reset",
  LOGIN: "login",
  LOGOUT: "logout",
  MAIL: "mail",
  OIL_BARREL: "oil_barrel",
  PERSON: "person",
  RADIO_BUTTON_UNCHECKED: "radio_button_unchecked",
  SCHEDULE: "schedule",
  SEARCH: "search",
  SPEED: "speed",
  SPORTS_MOTORSPORTS: "sports_motorsports",
  STOREFRONT: "storefront",
  SURFING: "surfing",
  SWAP_HORIZ: "swap_horiz",
  VISIBILITY: "visibility",
  VISIBILITY_OFF: "visibility_off",
  WARNING: "warning",
  WATER: "water",
  WAVES: "waves",
} as const;

export type MaterialIconName =
  (typeof MATERIAL_ICON_NAME)[keyof typeof MATERIAL_ICON_NAME];
