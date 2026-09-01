import {
  CALENDAR_VIEW,
  TIME,
  type CalendarView,
} from "@/app/constants";

const DAYS_IN_WEEK = 7;
const FIRST_MONTH_INDEX = 0;
const FIRST_DAY_OF_MONTH = 1;
const SUNDAY = 0;
const MONDAY = 1;
const DAYS_FROM_SUNDAY_TO_MONDAY = 6;

const COSTA_RICA_OFFSET_MS =
  TIME.CR.HOURS_OFFSET *
  TIME.UNITS.MINUTES_IN_HOUR *
  TIME.UNITS.SECONDS_IN_MINUTE *
  TIME.UNITS.MILLISECONDS_IN_SECOND;

/**
 * Shifts a real instant into "Costa Rica wall clock, read through UTC
 * getters" — every `getUTC*`/`setUTC*` call on the result reports Costa
 * Rica's own date and time, never the host's. The calendar and the
 * dispatch board both resolve "today"/"this week" on the server, where
 * the Node runtime is UTC in production (Vercel); without this shift,
 * `startOfDay` and friends would silently treat UTC as Costa Rica, which
 * is exactly what showed a 9 a.m. reservation as 3 p.m. and, between
 * 6 p.m. and midnight Costa Rica time, made the dispatch board start
 * showing tomorrow's reservations instead of today's. Same fixed -6h
 * shift `isWithinWorkday` already relies on — Costa Rica has never
 * observed daylight saving time, so a constant offset is exact, not an
 * approximation.
 */
const toCostaRicaWallClock = (date: Date): Date =>
  new Date(date.getTime() - COSTA_RICA_OFFSET_MS);

/** Reverses `toCostaRicaWallClock` back to the real instant it represents. */
const fromCostaRicaWallClock = (wallClock: Date): Date =>
  new Date(wallClock.getTime() + COSTA_RICA_OFFSET_MS);

const startOfDay = (date: Date): Date => {
  const wallClock = toCostaRicaWallClock(date);
  wallClock.setUTCHours(0, 0, 0, 0);
  return fromCostaRicaWallClock(wallClock);
};

const addDays = (date: Date, days: number): Date => {
  const wallClock = toCostaRicaWallClock(date);
  wallClock.setUTCDate(wallClock.getUTCDate() + days);
  return fromCostaRicaWallClock(wallClock);
};

const addMonths = (date: Date, months: number): Date => {
  const wallClock = toCostaRicaWallClock(date);
  wallClock.setUTCMonth(wallClock.getUTCMonth() + months);
  return fromCostaRicaWallClock(wallClock);
};

const addYears = (date: Date, years: number): Date => {
  const wallClock = toCostaRicaWallClock(date);
  wallClock.setUTCFullYear(
    wallClock.getUTCFullYear() + years
  );
  return fromCostaRicaWallClock(wallClock);
};

/** Monday-first week, to match the "acomodar el fin de semana" reading. */
const startOfWeek = (date: Date): Date => {
  const weekday = toCostaRicaWallClock(date).getUTCDay();
  const daysFromMonday =
    weekday === SUNDAY
      ? DAYS_FROM_SUNDAY_TO_MONDAY
      : weekday - MONDAY;
  return startOfDay(addDays(date, -daysFromMonday));
};

const startOfMonth = (date: Date): Date => {
  const wallClock = toCostaRicaWallClock(date);
  wallClock.setUTCDate(FIRST_DAY_OF_MONTH);
  return startOfDay(fromCostaRicaWallClock(wallClock));
};

const startOfYear = (date: Date): Date => {
  const wallClock = toCostaRicaWallClock(date);
  wallClock.setUTCMonth(
    FIRST_MONTH_INDEX,
    FIRST_DAY_OF_MONTH
  );
  return startOfDay(fromCostaRicaWallClock(wallClock));
};

export interface CalendarRange {
  endsAt: Date;
  nextReferenceDate: Date;
  previousReferenceDate: Date;
  startsAt: Date;
}

/**
 * US-RES-001/US-RES-015: the calendar and its availability checks both
 * work over a franja, never "right now". This is the one place that turns
 * a view and a reference date into that franja's boundaries, so day, week,
 * month and year never disagree about where one block ends and the next
 * begins.
 */
export const resolveCalendarRange = (
  view: CalendarView,
  referenceDate: Date
): CalendarRange => {
  switch (view) {
    case CALENDAR_VIEW.WEEK: {
      const startsAt = startOfWeek(referenceDate);
      return {
        endsAt: addDays(startsAt, DAYS_IN_WEEK),
        nextReferenceDate: addDays(startsAt, DAYS_IN_WEEK),
        previousReferenceDate: addDays(
          startsAt,
          -DAYS_IN_WEEK
        ),
        startsAt,
      };
    }
    case CALENDAR_VIEW.MONTH: {
      const startsAt = startOfMonth(referenceDate);
      return {
        endsAt: addMonths(startsAt, 1),
        nextReferenceDate: addMonths(startsAt, 1),
        previousReferenceDate: addMonths(startsAt, -1),
        startsAt,
      };
    }
    case CALENDAR_VIEW.YEAR: {
      const startsAt = startOfYear(referenceDate);
      return {
        endsAt: addYears(startsAt, 1),
        nextReferenceDate: addYears(startsAt, 1),
        previousReferenceDate: addYears(startsAt, -1),
        startsAt,
      };
    }
    default: {
      const startsAt = startOfDay(referenceDate);
      return {
        endsAt: addDays(startsAt, 1),
        nextReferenceDate: addDays(startsAt, 1),
        previousReferenceDate: addDays(startsAt, -1),
        startsAt,
      };
    }
  }
};

/**
 * Every day cell a month grid needs to render, Monday-first, padded to
 * full weeks on both ends so the grid is always a rectangle.
 */
export const buildMonthGridDays = (
  monthStart: Date
): Date[] => {
  const lastDayOfMonth = addDays(
    addMonths(monthStart, 1),
    -1
  );
  const days: Date[] = [];
  let cursor = startOfWeek(monthStart);

  while (
    cursor.getTime() <= lastDayOfMonth.getTime() ||
    toCostaRicaWallClock(cursor).getUTCDay() !== MONDAY
  ) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
};

/** The 12 month-start dates of the year a reference date falls in. */
export const buildYearMonths = (
  referenceDate: Date
): Date[] => {
  const yearStart = startOfYear(referenceDate);
  return Array.from({ length: 12 }, (_, monthIndex) =>
    addMonths(yearStart, monthIndex)
  );
};

export const toDateOnlyParam = (date: Date): string => {
  const wallClock = toCostaRicaWallClock(date);
  const year = wallClock.getUTCFullYear();
  const month = String(
    wallClock.getUTCMonth() + 1
  ).padStart(2, "0");
  const day = String(wallClock.getUTCDate()).padStart(
    2,
    "0"
  );
  return `${year}-${month}-${day}`;
};

/** "14:35" (24h, Costa Rica time) — the shape `<input type="time">` expects. */
export const toTimeOnlyParam = (date: Date): string => {
  const wallClock = toCostaRicaWallClock(date);
  const hours = String(wallClock.getUTCHours()).padStart(
    2,
    "0"
  );
  const minutes = String(
    wallClock.getUTCMinutes()
  ).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * A `date`/`time` field pair as one ISO instant — shared by the new-
 * reservation form (`useReservationDetailsFields`) and the postpone modal
 * (US-RES-020), the two places a worker types a date and a time and needs
 * the franja they resolve to.
 *
 * Deliberately not shifted through `toCostaRicaWallClock`: this only ever
 * runs in the browser, where `new Date(...)` already reads the date/time
 * as the worker's own local clock — Costa Rica's, since every worker is
 * physically there — and `toISOString()` stores that correctly as UTC.
 * The bug this file fixes is in reading dates back for display and in
 * resolving day/week/month/year windows on the server, not in how a
 * franja gets typed in and saved.
 */
export const computeStartsAtIso = (
  date: string,
  time: string
): string => {
  if (!date || !time) {
    return "";
  }
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString();
};

/**
 * The inverse of `toDateOnlyParam`: a `?date=2026-08-02`-shaped param,
 * read as a Costa Rica calendar day regardless of which zone the server
 * happens to be running in — the same day `/reservas/calendario` shows
 * when a worker clicks "Hoy" from that same zone.
 */
export const parseDateOnlyParam = (
  value: string | undefined
): Date => {
  if (!value) {
    return startOfDay(new Date());
  }
  const [year, month, day] = value.split("-").map(Number);
  const wallClock = new Date(
    Date.UTC(year, month - 1, day)
  );
  return Number.isNaN(wallClock.getTime())
    ? startOfDay(new Date())
    : fromCostaRicaWallClock(wallClock);
};
