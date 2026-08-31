/** Which action sheet, if any, is open on `/reservas/detalle/[reservationId]`. */
export const RESERVATION_DETAIL_MODAL = {
  CANCEL: "cancel",
  EDIT: "edit",
  NONE: "none",
  POSTPONE: "postpone",
  SPLIT: "split",
} as const;

export type ReservationDetailModal =
  (typeof RESERVATION_DETAIL_MODAL)[keyof typeof RESERVATION_DETAIL_MODAL];
