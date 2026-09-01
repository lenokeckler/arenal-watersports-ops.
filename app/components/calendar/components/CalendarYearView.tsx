import type { JSX } from "react";
import {
  CALENDAR_SCREEN,
  CALENDAR_VIEW,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import type { CalendarReservation } from "@/app/utils/reservas/calendar";
import { buildYearMonths } from "@/app/utils/reservas/calendarRange";
import { formatMonthLabel } from "@/app/utils/reservas/calendarLabels";
import { buildCalendarHref } from "../utils/buildCalendarHref";

interface CalendarYearViewProps {
  reservations: CalendarReservation[];
  yearReferenceDate: Date;
}

const countReservationsInMonth = (
  reservations: CalendarReservation[],
  monthStart: Date
): number =>
  reservations.filter((reservation) => {
    const startsAt = new Date(reservation.startsAt);
    return (
      startsAt.getFullYear() === monthStart.getFullYear() &&
      startsAt.getMonth() === monthStart.getMonth()
    );
  }).length;

/** US-RES-001: "cómo viene la temporada" — one tile per month, no detail. */
const CalendarYearView = ({
  reservations,
  yearReferenceDate,
}: CalendarYearViewProps): JSX.Element => (
  <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-4">
    {buildYearMonths(yearReferenceDate).map(
      (monthStart) => (
        <Link
          key={monthStart.toISOString()}
          href={buildCalendarHref(
            CALENDAR_VIEW.MONTH,
            monthStart
          )}
          className="flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container/40 p-md transition-colors hover:border-primary/40"
        >
          <span className="font-title-md text-title-md text-on-surface">
            {formatMonthLabel(monthStart)}
          </span>
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {CALENDAR_SCREEN.YEAR_MONTH_RESERVATIONS(
              countReservationsInMonth(
                reservations,
                monthStart
              )
            )}
          </span>
        </Link>
      )
    )}
  </div>
);

export default CalendarYearView;
