import type { JSX } from "react";
import type { CalendarReservation } from "@/app/utils/reservas/calendar";
import CalendarReservationCard from "./CalendarReservationCard";
import CalendarEmptyState from "./CalendarEmptyState";

const NO_RESERVATIONS = 0;

interface CalendarDayViewProps {
  reservations: CalendarReservation[];
}

/** US-RES-001: "operar el día" — every reservation for the day, in order. */
const CalendarDayView = ({
  reservations,
}: CalendarDayViewProps): JSX.Element =>
  reservations.length === NO_RESERVATIONS ? (
    <CalendarEmptyState />
  ) : (
    <div className="flex flex-col gap-sm">
      {reservations.map((reservation) => (
        <CalendarReservationCard
          key={reservation.id}
          reservation={reservation}
        />
      ))}
    </div>
  );

export default CalendarDayView;
