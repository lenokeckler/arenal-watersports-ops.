import {
  MATERIAL_ICON_NAME,
  type MaterialIconName,
} from "@/app/components/icons/material-icon/constants";

/** Mirrors the database's `reservation_status` enum (section 5.1). */
export const RESERVATION_STATUS = {
  CANCELLED: "cancelled",
  CLOSED: "closed",
  DISPATCHED: "dispatched",
  SCHEDULED: "scheduled",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const RESERVATION_STATUS_LABEL = {
  [RESERVATION_STATUS.CANCELLED]: "Cancelada",
  [RESERVATION_STATUS.CLOSED]: "Cerrada",
  [RESERVATION_STATUS.DISPATCHED]: "Despachada",
  [RESERVATION_STATUS.SCHEDULED]: "Agendada",
} as const satisfies Record<ReservationStatus, string>;

/**
 * US-TAB-009: the history is closed and cancelled reservations only —
 * a scheduled or dispatched reservation is still live operational state,
 * not history yet.
 */
export const HISTORY_RESERVATION_STATUSES: readonly ReservationStatus[] =
  [RESERVATION_STATUS.CLOSED, RESERVATION_STATUS.CANCELLED];

/** One badge style per status, shared by the calendar and the detail screen. */
export const RESERVATION_STATUS_BADGE = {
  [RESERVATION_STATUS.CANCELLED]: {
    CLASS_NAME: "border-error/30 bg-error/10 text-error",
    ICON: MATERIAL_ICON_NAME.CLOSE,
  },
  [RESERVATION_STATUS.CLOSED]: {
    CLASS_NAME:
      "border-outline-variant bg-surface-variant text-on-surface-variant",
    ICON: MATERIAL_ICON_NAME.CHECK_CIRCLE,
  },
  [RESERVATION_STATUS.DISPATCHED]: {
    CLASS_NAME:
      "border-tertiary/30 bg-tertiary/10 text-tertiary",
    ICON: MATERIAL_ICON_NAME.DIRECTIONS_BOAT,
  },
  [RESERVATION_STATUS.SCHEDULED]: {
    CLASS_NAME:
      "border-primary/30 bg-primary/10 text-primary",
    ICON: MATERIAL_ICON_NAME.SCHEDULE,
  },
} as const satisfies Record<
  ReservationStatus,
  { CLASS_NAME: string; ICON: MaterialIconName }
>;
