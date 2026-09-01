import type { JSX } from "react";
import {
  CALENDAR_VIEW,
  WEEKDAYS_LABEL_MONO,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import {
  groupReservationsByDate,
  type CalendarReservation,
} from "@/app/utils/reservas/calendar";
import {
  buildMonthGridDays,
  toDateOnlyParam,
} from "@/app/utils/reservas/calendarRange";
import { buildCalendarHref } from "../utils/buildCalendarHref";

const MAX_VISIBLE_CODES = 2;

interface CalendarMonthViewProps {
  monthStart: Date;
  reservations: CalendarReservation[];
}

/** US-RES-001: how the season is coming — a count per day, not the detail. */
const CalendarMonthView = ({
  monthStart,
  reservations,
}: CalendarMonthViewProps): JSX.Element => {
  const groupedByDate =
    groupReservationsByDate(reservations);
  const days = buildMonthGridDays(monthStart);
  const isCurrentMonth = (day: Date): boolean =>
    day.getMonth() === monthStart.getMonth();

  return (
    <div className="grid grid-cols-7 gap-1 rounded-xl border border-outline-variant bg-surface-container/40 p-sm">
      {WEEKDAYS_LABEL_MONO.map((weekdayLabel) => (
        <span
          key={weekdayLabel}
          className="p-1 text-center font-label-mono text-label-mono text-on-surface-variant"
        >
          {weekdayLabel}
        </span>
      ))}

      {days.map((day) => {
        const dayReservations =
          groupedByDate.get(toDateOnlyParam(day)) ?? [];
        return (
          <Link
            key={toDateOnlyParam(day)}
            href={buildCalendarHref(CALENDAR_VIEW.DAY, day)}
            className={`flex min-h-20 flex-col gap-1 rounded-lg border border-outline-variant/50 p-1 transition-colors hover:border-primary/40 ${
              isCurrentMonth(day)
                ? "bg-surface-container-low"
                : "opacity-40"
            }`}
          >
            <span className="font-label-mono text-label-mono text-on-surface">
              {day.getDate()}
            </span>
            {dayReservations
              .slice(0, MAX_VISIBLE_CODES)
              .map((reservation) => (
                <span
                  key={reservation.id}
                  className="truncate rounded bg-primary/10 px-1 font-label-mono text-[10px] text-primary"
                >
                  {reservation.code}
                </span>
              ))}
            {dayReservations.length > MAX_VISIBLE_CODES && (
              <span className="font-label-mono text-[10px] text-on-surface-variant">
                +
                {dayReservations.length - MAX_VISIBLE_CODES}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
};

export default CalendarMonthView;
