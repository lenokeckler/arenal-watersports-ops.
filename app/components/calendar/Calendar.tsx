import type { JSX } from "react";
import { CALENDAR_VIEW } from "@/app/constants";
import CalendarHeader from "./components/CalendarHeader";
import CalendarViewSwitcher from "./components/CalendarViewSwitcher";
import CalendarNav from "./components/CalendarNav";
import CalendarDayView from "./components/CalendarDayView";
import CalendarWeekView from "./components/CalendarWeekView";
import CalendarMonthView from "./components/CalendarMonthView";
import CalendarYearView from "./components/CalendarYearView";
import type { CalendarProps } from "./models/CalendarProps.interface";

/**
 * `/reservas/calendario` (US-RES-001, US-RES-002, and the entry point into
 * US-RES-004). A Server Component end to end — view switching and date
 * navigation are plain links carrying `?view=&date=`, so this screen needs
 * no client JavaScript, matching the "one hand, bad signal" mandate.
 */
const Calendar = ({
  allowedViews,
  canCreate,
  range,
  referenceDate,
  reservations,
  view,
}: CalendarProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <CalendarHeader canCreate={canCreate} />

    <main className="mx-auto flex max-w-6xl flex-col gap-md">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <CalendarViewSwitcher
          allowedViews={allowedViews}
          referenceDate={referenceDate}
          view={view}
        />
      </div>

      <CalendarNav
        range={range}
        view={view}
      />

      {view === CALENDAR_VIEW.DAY && (
        <CalendarDayView reservations={reservations} />
      )}
      {view === CALENDAR_VIEW.WEEK && (
        <CalendarWeekView
          reservations={reservations}
          weekStart={range.startsAt}
        />
      )}
      {view === CALENDAR_VIEW.MONTH && (
        <CalendarMonthView
          monthStart={range.startsAt}
          reservations={reservations}
        />
      )}
      {view === CALENDAR_VIEW.YEAR && (
        <CalendarYearView
          reservations={reservations}
          yearReferenceDate={range.startsAt}
        />
      )}
    </main>
  </div>
);

export default Calendar;
