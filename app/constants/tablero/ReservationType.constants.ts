/** Mirrors the database's `reservation_type` enum (section 5.1). */
export const RESERVATION_TYPE = {
  COMBO: "combo",
  RENTAL: "rental",
  TOUR: "tour",
} as const;

export type ReservationType =
  (typeof RESERVATION_TYPE)[keyof typeof RESERVATION_TYPE];

export const RESERVATION_TYPE_LABEL = {
  [RESERVATION_TYPE.COMBO]: "Combo",
  [RESERVATION_TYPE.RENTAL]: "Renta",
  [RESERVATION_TYPE.TOUR]: "Tour",
} as const satisfies Record<ReservationType, string>;
