export const DATE = {
  DAY_MONTH_YEAR: "dd/mm/yyyy",
  YEAR_MONTH_DAY: "yyyy-mm-dd",
  DIVIDE_IN_DATE_AND_HOUR: "T",
  GET_ONLY_DATE: 0,
};

/**
 * The company operates in one place — Lake Arenal, Costa Rica — so every
 * date/time display and every "today"/"this week" window the server
 * computes must be pinned to `CR.TIME_ZONE` (or shifted by `HOURS_OFFSET`,
 * for the plain arithmetic that can't take an IANA name). Never resolve a
 * time zone from the runtime environment: Vercel's Node runtime is UTC, so
 * anything that reads the environment's own zone renders a 9 a.m.
 * reservation as 3 p.m.
 */
export const TIME = {
  CR: {
    HOURS_OFFSET: 6,
    TIME_ZONE: "America/Costa_Rica",
  },
  UNITS: {
    MINUTES_IN_HOUR: 60,
    SECONDS_IN_MINUTE: 60,
    MILLISECONDS_IN_SECOND: 1000,
  },
} as const;

export const FORMAT_DATE = {
  PAD_LENGTH: 2,
  PAD_CHAR: "0",
};
