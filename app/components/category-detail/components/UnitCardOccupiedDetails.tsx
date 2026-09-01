import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  MATERIAL_ICON_NAME,
  PATHS,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { formatShortTime } from "@/app/utils/tablero/formatDateTime";
import type { CategoryDetailUnit } from "@/app/utils/tablero/categoryDetail";
import type { TimeRemaining } from "@/app/utils/operaciones/timeRemaining";

interface UnitCardOccupiedDetailsProps {
  timeRemaining: Nullable<TimeRemaining>;
  unit: CategoryDetailUnit;
}

/**
 * The occupied half of a unit card: return time, how long is left (or how
 * far overdue, bolded in the overdue tint's own color), who has it, and a
 * link into the reservation's detail (US-TAB-002).
 */
const UnitCardOccupiedDetails = ({
  timeRemaining,
  unit,
}: UnitCardOccupiedDetailsProps): JSX.Element => (
  <div className="flex flex-col gap-xs font-label-mono text-label-mono text-on-surface-variant">
    {unit.returnsAt && (
      <span>
        {CATEGORY_DETAIL_SCREEN.RETURNS_AT}{" "}
        {formatShortTime(unit.returnsAt)}
      </span>
    )}
    {timeRemaining && (
      <span
        className={
          timeRemaining.isOverdue
            ? "font-bold text-secondary"
            : undefined
        }
      >
        {timeRemaining.isOverdue
          ? CATEGORY_DETAIL_SCREEN.OVERDUE_BY_MINUTES(
              timeRemaining.minutes
            )
          : CATEGORY_DETAIL_SCREEN.FREE_IN_MINUTES(
              timeRemaining.minutes
            )}
      </span>
    )}
    {unit.customerName && (
      <span>
        {CATEGORY_DETAIL_SCREEN.CARRIED_BY}:{" "}
        {unit.customerName}
      </span>
    )}
    {unit.reservationId && (
      <Link
        href={PATHS.RESERVATIONS.DETAIL_BY_ID(
          unit.reservationId
        )}
        className="mt-xs inline-flex min-h-10 items-center gap-1 text-primary"
      >
        {unit.reservationCode ??
          CATEGORY_DETAIL_SCREEN.RESERVATION_LINK}
        <MaterialIcon
          name={MATERIAL_ICON_NAME.CHEVRON_RIGHT}
          className="!text-[16px]"
        />
      </Link>
    )}
  </div>
);

export default UnitCardOccupiedDetails;
