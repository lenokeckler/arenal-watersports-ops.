import { PATHS, type CalendarView } from "@/app/constants";
import { toDateOnlyParam } from "@/app/utils/reservas/calendarRange";

/** `?view=week&date=2026-08-30` — every calendar link is built this way. */
export const buildCalendarHref = (
  view: CalendarView,
  date: Date
): string => {
  const searchParams = new URLSearchParams({
    date: toDateOnlyParam(date),
    view,
  });
  return `${PATHS.RESERVATIONS.CALENDAR}?${searchParams.toString()}`;
};
