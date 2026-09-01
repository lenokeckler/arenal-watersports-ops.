import {
  CALENDAR_VIEW,
  TIME,
  type CalendarView,
} from "@/app/constants";
import type { CalendarRange } from "./calendarRange";

const LOCALE = "es-CR";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Pinned to the company's own zone — the server (Vercel's Node runtime)
// renders in UTC, so formatting without an explicit zone could show the
// wrong calendar day right around midnight, Costa Rica time.
const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME.CR.TIME_ZONE,
};

const MONTH_YEAR_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
  timeZone: TIME.CR.TIME_ZONE,
};
const MONTH_ONLY_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  timeZone: TIME.CR.TIME_ZONE,
};
const DAY_SHORT_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: TIME.CR.TIME_ZONE,
};
const WEEKDAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  weekday: "long",
  timeZone: TIME.CR.TIME_ZONE,
};

const capitalize = (label: string): string =>
  label.replace(/^\p{L}/u, (firstLetter) =>
    firstLetter.toUpperCase()
  );

/**
 * US-RES-001: the calendar header's date label, worded to match the level
 * of detail of the active view — a single day, a week's span, a month, or
 * a year.
 */
export const formatCalendarRangeLabel = (
  view: CalendarView,
  range: CalendarRange
): string => {
  if (view === CALENDAR_VIEW.DAY) {
    return capitalize(
      range.startsAt.toLocaleDateString(
        LOCALE,
        LONG_DATE_FORMAT
      )
    );
  }

  if (view === CALENDAR_VIEW.MONTH) {
    return capitalize(
      range.startsAt.toLocaleDateString(
        LOCALE,
        MONTH_YEAR_FORMAT
      )
    );
  }

  if (view === CALENDAR_VIEW.YEAR) {
    return String(range.startsAt.getFullYear());
  }

  const lastDayOfWeek = new Date(
    range.endsAt.getTime() - ONE_DAY_MS
  );
  const start = capitalize(
    range.startsAt.toLocaleDateString(
      LOCALE,
      DAY_SHORT_FORMAT
    )
  );
  const end = capitalize(
    lastDayOfWeek.toLocaleDateString(
      LOCALE,
      LONG_DATE_FORMAT
    )
  );
  return `${start} — ${end}`;
};

export const formatMonthLabel = (
  monthStart: Date
): string =>
  capitalize(
    monthStart.toLocaleDateString(LOCALE, MONTH_ONLY_FORMAT)
  );

export const formatWeekdayLabel = (date: Date): string =>
  capitalize(
    date.toLocaleDateString(LOCALE, WEEKDAY_FORMAT)
  );
