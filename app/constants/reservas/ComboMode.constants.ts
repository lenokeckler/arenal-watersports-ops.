/**
 * US-RES-009/US-RES-010: how a `combo` reservation is assembled — from
 * administración's predefined list, or picked equipment by equipment. This
 * has no database column of its own; it only decides which section of
 * `ReservationForm` is active before the items are built.
 */
export const COMBO_MODE = {
  CUSTOM: "custom",
  PREDEFINED: "predefined",
} as const;

export type ComboMode =
  (typeof COMBO_MODE)[keyof typeof COMBO_MODE];
