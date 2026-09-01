import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  RESERVATION_CHARGES_SCREEN,
  RESERVATION_STATUS_BADGE,
  RESERVATION_STATUS_LABEL,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import Badge from "@/app/components/badge/Badge";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import type { ReservationMoneyContext } from "@/app/utils/reservas/reservationMoneyContext";

interface ReservationChargesHeaderProps {
  context: ReservationMoneyContext;
}

/** Who is being charged, for which reservation, and the way back to its detail. */
const ReservationChargesHeader = ({
  context,
}: ReservationChargesHeaderProps): JSX.Element => (
  <header className="mx-auto mb-lg flex max-w-3xl items-center gap-sm">
    <Link
      href={PATHS.RESERVATIONS.DETAIL_BY_ID(context.id)}
      aria-label={RESERVATION_CHARGES_SCREEN.BACK_TO_DETAIL}
      className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-high text-on-surface-variant hover:text-primary"
    >
      <MaterialIcon name={MATERIAL_ICON_NAME.ARROW_BACK} />
    </Link>
    <div className="flex flex-col">
      <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
        {RESERVATION_CHARGES_SCREEN.TITLE}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-label-mono text-label-mono text-on-surface-variant">
          {context.code} · {context.customerName}
        </span>
        <Badge
          className={
            RESERVATION_STATUS_BADGE[context.status]
              .CLASS_NAME
          }
        >
          {RESERVATION_STATUS_LABEL[context.status]}
        </Badge>
      </div>
    </div>
  </header>
);

export default ReservationChargesHeader;
