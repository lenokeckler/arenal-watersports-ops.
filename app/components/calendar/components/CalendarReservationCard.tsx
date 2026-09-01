import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  RESERVATION_STATUS_BADGE,
  RESERVATION_TYPE_LABEL,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import Badge from "@/app/components/badge/Badge";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { formatShortTime } from "@/app/utils/tablero/formatDateTime";
import type { CalendarReservation } from "@/app/utils/reservas/calendar";

interface CalendarReservationCardProps {
  reservation: CalendarReservation;
}

/**
 * US-RES-002/US-RES-014: the hour, the committed equipment, the customer
 * name and — for a tour — who is guiding it, the minimum needed to answer
 * a call without opening the reservation.
 */
const CalendarReservationCard = ({
  reservation,
}: CalendarReservationCardProps): JSX.Element => (
  <Link
    href={PATHS.RESERVATIONS.DETAIL_BY_ID(reservation.id)}
    className="flex flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container/60 p-sm transition-colors hover:border-primary/40"
  >
    <div className="flex items-center justify-between gap-sm">
      <span className="font-label-mono text-label-mono text-primary">
        {formatShortTime(reservation.startsAt)} –{" "}
        {formatShortTime(reservation.endsAt)}
      </span>
      <Badge
        className={
          RESERVATION_STATUS_BADGE[reservation.status]
            .CLASS_NAME
        }
      >
        {RESERVATION_TYPE_LABEL[reservation.type]}
      </Badge>
    </div>
    <span className="font-body-base text-body-base text-on-surface">
      {reservation.customerName}
    </span>
    {reservation.equipmentSummary.length > 0 && (
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {reservation.equipmentSummary.join(", ")}
      </span>
    )}
    {reservation.guideNames.length > 0 && (
      <span className="flex items-center gap-1 font-label-mono text-label-mono text-primary">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.GROUP}
          className="!text-[14px]"
        />
        {reservation.guideNames.join(", ")}
      </span>
    )}
  </Link>
);

export default CalendarReservationCard;
