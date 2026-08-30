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
export const HISTORY_RESERVATION_STATUSES: readonly ReservationStatus[] = [
  RESERVATION_STATUS.CLOSED,
  RESERVATION_STATUS.CANCELLED,
];
