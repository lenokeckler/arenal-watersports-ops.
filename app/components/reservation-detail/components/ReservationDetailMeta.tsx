import type { JSX } from "react";
import { RESERVATION_DETAIL_SCREEN } from "@/app/constants";
import {
  formatShortDate,
  formatShortTime,
} from "@/app/utils/tablero/formatDateTime";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";

interface ReservationDetailMetaProps {
  reservation: ReservationDetail;
}

interface RowProps {
  label: string;
  value: string;
}

const Row = ({ label, value }: RowProps): JSX.Element => (
  <div className="flex items-center justify-between gap-sm">
    <span className="font-label-mono text-label-mono text-on-surface-variant">
      {label}
    </span>
    <span className="font-body-base text-body-base text-on-surface">
      {value}
    </span>
  </div>
);

/**
 * US-RES-003: the franja, who created the reservation and who last touched
 * it — the detail that says who to ask when something does not add up.
 */
const ReservationDetailMeta = ({
  reservation,
}: ReservationDetailMetaProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {RESERVATION_DETAIL_SCREEN.META.TITLE}
    </h2>

    <Row
      label={formatShortDate(reservation.startsAt)}
      value={`${formatShortTime(reservation.startsAt)} – ${formatShortTime(reservation.endsAt)}`}
    />
    <Row
      label={RESERVATION_DETAIL_SCREEN.META.PEOPLE_COUNT}
      value={String(reservation.peopleCount)}
    />
    <Row
      label={RESERVATION_DETAIL_SCREEN.META.DURATION}
      value={RESERVATION_DETAIL_SCREEN.META.DURATION_VALUE(
        reservation.durationMinutes
      )}
    />
    {reservation.dispatchedAt && (
      <Row
        label={RESERVATION_DETAIL_SCREEN.META.DISPATCHED_AT}
        value={formatShortTime(reservation.dispatchedAt)}
      />
    )}
    {reservation.cancellationReason && (
      <Row
        label={
          RESERVATION_DETAIL_SCREEN.META.CANCELLATION_REASON
        }
        value={reservation.cancellationReason}
      />
    )}

    <div className="mt-1 flex flex-col gap-1 border-t border-white/5 pt-sm font-label-mono text-label-mono text-on-surface-variant">
      <span>
        {RESERVATION_DETAIL_SCREEN.META.CREATED_BY(
          reservation.createdByName
        )}
      </span>
      <span>
        {RESERVATION_DETAIL_SCREEN.META.UPDATED_BY(
          reservation.updatedByName
        )}
      </span>
    </div>
  </section>
);

export default ReservationDetailMeta;
