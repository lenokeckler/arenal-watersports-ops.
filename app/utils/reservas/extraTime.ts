import {
  RESERVATION_STATUS,
  TIME,
  type ReservationStatus,
} from "@/app/constants";
import type { Nullable } from "@/app/types";

const NO_MINUTES = 0;
const MILLISECONDS_IN_MINUTE =
  TIME.UNITS.SECONDS_IN_MINUTE *
  TIME.UNITS.MILLISECONDS_IN_SECOND;

export interface ExtraTimeParams {
  closedAt: Nullable<string>;
  endsAt: string;
  /** `reservations.extra_time_minutes`: what operaciones extended on the spot. */
  extendedMinutes: number;
  referenceTime: number;
  status: ReservationStatus;
}

/**
 * US-RES-031: the extra time arrives from two sides — the outing that ran
 * past its hour without warning, measured against `ends_at`, and the one
 * operaciones extended on the spot, already stored in
 * `extra_time_minutes`. A reservation that never went out only carries
 * the second. Whether those minutes are charged or go as a courtesy is
 * reservas' call; this only counts them.
 */
export const extraTimeMinutes = ({
  closedAt,
  endsAt,
  extendedMinutes,
  referenceTime,
  status,
}: ExtraTimeParams): number => {
  const wentOut =
    status === RESERVATION_STATUS.DISPATCHED ||
    status === RESERVATION_STATUS.CLOSED;
  if (!wentOut) {
    return extendedMinutes;
  }

  const returnedAt = closedAt
    ? new Date(closedAt).getTime()
    : referenceTime;
  const overdueMinutes = Math.floor(
    (returnedAt - new Date(endsAt).getTime()) /
      MILLISECONDS_IN_MINUTE
  );

  return (
    extendedMinutes + Math.max(overdueMinutes, NO_MINUTES)
  );
};
