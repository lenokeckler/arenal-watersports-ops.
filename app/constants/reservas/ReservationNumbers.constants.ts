/**
 * Numeric domain values for the reservations calendar and creation form
 * (EP-RES-01, EP-RES-02, EP-RES-05).
 */
export const RESERVATION_NUMBERS = {
  /** Debounces the live availability RPC calls while the franja is edited. */
  AVAILABILITY_DEBOUNCE_MS: 400,
  /** Quick-pick buttons next to the free-form duration input. */
  DURATION_PRESETS_MINUTES: [30, 60, 120] as const,
  /** US-RES-020: `equipment_units.current_fuel` is a tank percentage. */
  FUEL_PERCENT_MAX: 100,
  FUEL_PERCENT_MIN: 0,
  MIN_DURATION_MINUTES: 1,
  MIN_PEOPLE_COUNT: 1,
  MIN_QUANTITY: 0,
  /** US-RES-019: at least one person stays on each side of a split. */
  MIN_SPLIT_PEOPLE_COUNT: 1,
} as const;
