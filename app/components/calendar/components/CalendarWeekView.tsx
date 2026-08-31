import type { JSX } from "react";
import {
  groupReservationsByDate,
  type CalendarReservation,
} from "@/app/utils/reservas/calendar";
import { toDateOnlyParam } from "@/app/utils/reservas/calendarRange";
import { formatWeekdayLabel } from "@/app/utils/reservas/calendarLabels";
import CalendarReservationCard from "./CalendarReservationCard";

const DAYS_IN_WEEK = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NO_RESERVATIONS = 0;

interface CalendarWeekViewProps {
  reservations: CalendarReservation[];
  weekStart: Date;
}

/** US-RES-001: "acomodar el fin de semana" — one agenda section per day. */
const CalendarWeekView = ({
  reservations,
  weekStart,
}: CalendarWeekViewProps): JSX.Element => {
  const groupedByDate =
    groupReservationsByDate(reservations);
  const days = Array.from(
    { length: DAYS_IN_WEEK },
    (_, dayIndex) =>
      new Date(weekStart.getTime() + dayIndex * MS_PER_DAY)
  );

  return (
    <div className="flex flex-col gap-md">
      {days.map((day) => {
        const dayReservations =
          groupedByDate.get(toDateOnlyParam(day)) ?? [];
        return (
          <section
            key={toDateOnlyParam(day)}
            className="flex flex-col gap-sm"
          >
            <h2 className="font-title-md text-title-md text-on-surface">
              {formatWeekdayLabel(day)}
            </h2>
            {dayReservations.length === NO_RESERVATIONS ? (
              <p className="font-body-base text-body-base text-on-surface-variant">
                —
              </p>
            ) : (
              dayReservations.map((reservation) => (
                <CalendarReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
};

export default CalendarWeekView;
