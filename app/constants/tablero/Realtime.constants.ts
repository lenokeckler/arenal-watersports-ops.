/**
 * `reservations`, `reservation_items`, `equipment_units` and
 * `equipment_stock` are already in the `supabase_realtime` publication
 * (US-TAB-003). The debounce coalesces a dispatch, which writes to more
 * than one of those tables at once, into a single refetch.
 */
export const REALTIME_TABLE = {
  EQUIPMENT_STOCK: "equipment_stock",
  EQUIPMENT_UNITS: "equipment_units",
  RESERVATIONS: "reservations",
  RESERVATION_ITEMS: "reservation_items",
} as const;

export const REALTIME = {
  CHANNEL_PREFIX: "tablero-",
  DEBOUNCE_MS: 300,
  EVENT_ALL: "*",
  SCHEMA_PUBLIC: "public",
  WATCHED_TABLES: [
    REALTIME_TABLE.RESERVATIONS,
    REALTIME_TABLE.RESERVATION_ITEMS,
    REALTIME_TABLE.EQUIPMENT_UNITS,
    REALTIME_TABLE.EQUIPMENT_STOCK,
  ],
} as const;
