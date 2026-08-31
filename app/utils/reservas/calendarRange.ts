import {
  CALENDAR_VIEW,
  type CalendarView,
} from "@/app/constants";

const DAYS_IN_WEEK = 7;
const FIRST_MONTH_INDEX = 0;
const FIRST_DAY_OF_MONTH = 1;
const SUNDAY = 0;
const MONDAY = 1;
const DAYS_FROM_SUNDAY_TO_MONDAY = 6;

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

/** Monday-first week, to match the "acomodar el fin de semana" reading. */
const startOfWeek = (date: Date): Date => {
  const daysFromMonday =
    date.getDay() === SUNDAY
      ? DAYS_FROM_SUNDAY_TO_MONDAY
      : date.getDay() - MONDAY;
  return startOfDay(addDays(date, -daysFromMonday));
};

const startOfMonth = (date: Date): Date =>
  startOfDay(
    new Date(
      date.getFullYear(),
      date.getMonth(),
      FIRST_DAY_OF_MONTH
    )
  );

const startOfYear = (date: Date): Date =>
  startOfDay(
    new Date(
      date.getFullYear(),
      FIRST_MONTH_INDEX,
      FIRST_DAY_OF_MONTH
    )
  );

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
    cursor.getDay() !== MONDAY
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateOnlyParam = (
  value: string | undefined
): Date => {
  if (!value) {
    return startOfDay(new Date());
  }
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? startOfDay(new Date())
    : parsed;
};
