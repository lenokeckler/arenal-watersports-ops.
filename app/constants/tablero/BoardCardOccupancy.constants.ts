/**
 * The `/tablero` category card (US-TAB-001) needs its own tri-state read,
 * separate from the per-unit `EQUIPMENT_UNIT_STATUS_BADGE`: an aggregate
 * card has no single unit status, only how many of its units are currently
 * out. `resolveBoardCardOccupancy` (`app/utils/tablero/board.ts`) decides
 * which of these applies.
 */
export const BOARD_CARD_OCCUPANCY = {
  FREE: "free",
  FULL: "full",
  PARTIAL: "partial",
} as const;

export type BoardCardOccupancy =
  (typeof BOARD_CARD_OCCUPANCY)[keyof typeof BOARD_CARD_OCCUPANCY];

/**
 * Built only from tokens already in `app/globals.css`: `primary` matches the
 * existing "available" accent, `tertiary` matches the per-unit `occupied`
 * badge, and `error` is reserved for the one case this screen used to hide
 * completely — nothing left free.
 */
export const BOARD_CARD_OCCUPANCY_CLASS = {
  [BOARD_CARD_OCCUPANCY.FREE]: {
    BAR: "bg-primary",
    BORDER: "border-outline-variant/50",
  },
  [BOARD_CARD_OCCUPANCY.FULL]: {
    BAR: "bg-error",
    BORDER: "border-error/40",
  },
  [BOARD_CARD_OCCUPANCY.PARTIAL]: {
    BAR: "bg-tertiary",
    BORDER: "border-tertiary/40",
  },
} as const satisfies Record<
  BoardCardOccupancy,
  { BAR: string; BORDER: string }
>;
