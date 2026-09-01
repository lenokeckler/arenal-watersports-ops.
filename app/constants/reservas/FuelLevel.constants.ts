/**
 * US-OPE-003/US-OPE-010/US-OPE-020: gasoline is read off the physical lines
 * on the gauge, not a percentage — `equipment_units.fuel_level`/`fuel_max`
 * and `reservation_items.fuel_out`/`fuel_in` all count lines out of the
 * unit's own maximum, which is configurable per unit (a boat's dash and a
 * jet ski's do not carry the same number of lines).
 */
export const FUEL_LEVEL_NUMBERS = {
  /** `equipment_units.fuel_max`'s own default, mirrored client-side. */
  DEFAULT_MAX: 4,
  MAX_MAX: 20,
  MIN: 0,
  MIN_MAX: 1,
} as const;
