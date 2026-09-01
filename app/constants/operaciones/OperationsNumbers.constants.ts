/**
 * Numeric domain values for the operations module (EP-OPE-01, EP-OPE-02):
 * dispatch, the equipment-out monitor, and closing a reservation.
 */
export const OPERATIONS_NUMBERS = {
  /** US-OPE-004: how often the "time remaining" countdown re-renders. */
  CLOCK_TICK_MS: 30_000,
  /** US-OPE-013: how many more impacts a unit picked up in this incident. */
  IMPACT_DELTA_MIN: 0,
  MIN_DURATION_MINUTES: 1,
} as const;
