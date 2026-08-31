/**
 * US-RES-007/US-RES-009/US-RES-010: what "this reservation commits
 * equipment" means depends on the type — renta/tour's free-form picker, a
 * combo predefined (missing a required unit slot is a different message
 * than picking no combo at all), or a combo a la medida. Not a database
 * value; only decides which validation message `ReservationForm` shows.
 */
export const EQUIPMENT_VALIDITY = {
  COMBO_INCOMPLETE: "combo-incomplete",
  COMBO_REQUIRED: "combo-required",
  INVALID: "invalid",
  VALID: "valid",
} as const;

export type EquipmentValidity =
  (typeof EQUIPMENT_VALIDITY)[keyof typeof EQUIPMENT_VALIDITY];
