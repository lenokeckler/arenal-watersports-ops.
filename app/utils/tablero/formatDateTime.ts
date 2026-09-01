import { TIME } from "@/app/constants";

const LOCALE = "es-CR";

// Pinned to the company's own zone — the server (Vercel's Node runtime)
// renders in UTC, so formatting without an explicit zone showed a 9 a.m.
// Costa Rica reservation as 3 p.m.
const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME.CR.TIME_ZONE,
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIME.CR.TIME_ZONE,
};

/** "14:35" from an ISO timestamp — used for a unit's return time. */
export const formatShortTime = (
  isoTimestamp: string
): string =>
  new Intl.DateTimeFormat(LOCALE, TIME_FORMAT).format(
    new Date(isoTimestamp)
  );

/** "29/08/2026" from an ISO timestamp — used by the history table. */
export const formatShortDate = (
  isoTimestamp: string
): string =>
  new Intl.DateTimeFormat(LOCALE, DATE_FORMAT).format(
    new Date(isoTimestamp)
  );

/**
 * "31/08/2026" from a `date` column, which arrives as "YYYY-MM-DD" with no
 * time and no zone. Reordering the parts beats `new Date(...)`: the
 * constructor reads a bare date as UTC midnight and then prints it in the
 * local zone, which in Costa Rica (UTC-6) shows the day before. That is
 * what `maintenance_records.performed_at` and `equipment_stock.expiry_date`
 * were doing before this existed.
 */
export const formatCalendarDate = (
  dateOnly: string
): string => {
  const [year, month, day] = dateOnly.split("-");

  return `${day}/${month}/${year}`;
};
