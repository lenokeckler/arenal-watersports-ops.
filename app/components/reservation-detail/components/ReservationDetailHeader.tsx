import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  RESERVATION_STATUS_BADGE,
  RESERVATION_STATUS_LABEL,
  RESERVATION_TYPE_LABEL,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import Badge from "@/app/components/badge/Badge";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { ReservationDetail } from "@/app/utils/reservas/reservationDetail";

interface ReservationDetailHeaderProps {
  reservation: ReservationDetail;
}

/** US-RES-003: code, customer, status and type, at a glance. */
const ReservationDetailHeader = ({
  reservation,
}: ReservationDetailHeaderProps): JSX.Element => (
  <header className="mx-auto mb-lg flex max-w-3xl items-center gap-sm">
    <Link
      href={PATHS.RESERVATIONS.CALENDAR}
      className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary"
    >
      <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
    </Link>
    <div className="flex flex-col">
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {reservation.customerName}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {reservation.code}
        </span>
        <Badge
          className={
            RESERVATION_STATUS_BADGE[reservation.status]
              .CLASS_NAME
          }
        >
          {RESERVATION_STATUS_LABEL[reservation.status]}
        </Badge>
        <Badge className="border-outline-variant bg-surface-container-high text-on-surface-variant">
          {RESERVATION_TYPE_LABEL[reservation.type]}
        </Badge>
      </div>
    </div>
  </header>
);

export default ReservationDetailHeader;
