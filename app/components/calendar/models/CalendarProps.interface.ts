import type { CalendarView } from "@/app/constants";
import type { CalendarRange } from "@/app/utils/reservas/calendarRange";
import type { CalendarReservation } from "@/app/utils/reservas/calendar";

export interface CalendarProps {
  allowedViews: readonly CalendarView[];
  canCreate: boolean;
  /** US-RES-013: only reservas with `registro_guias_externos`. */
  canCreateExternalGuide: boolean;
  range: CalendarRange;
  referenceDate: Date;
  reservations: CalendarReservation[];
  view: CalendarView;
}
