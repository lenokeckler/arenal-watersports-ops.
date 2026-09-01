import type { JSX } from "react";
import { CALENDAR_VIEW } from "@/app/constants";
import { buildCalendarViewRedirectScript } from "@/app/utils/reservas/calendarViewStorage";
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
 * navigation are plain links carrying `?view=&date=`, matching the "one
 * hand, bad signal" mandate. The one exception is the inline `<script>`
 * from `buildCalendarViewRedirectScript`, the same technique the root
 * layout's theme script uses: it needs no hydration and no client bundle,
 * it only redirects to the device's last-used view when the URL did not
 * already name one (US-RES-001's "vuelvo al calendario y dice semana").
 */
const Calendar = ({
  allowedViews,
  canCreate,
  canCreateExternalGuide,
  range,
  referenceDate,
  reservations,
  view,
}: CalendarProps): JSX.Element => (
  <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
    <script
      dangerouslySetInnerHTML={{
        __html: buildCalendarViewRedirectScript(
          view,
          allowedViews
        ),
      }}
    />

    <CalendarHeader
      canCreate={canCreate}
      canCreateExternalGuide={canCreateExternalGuide}
    />

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
