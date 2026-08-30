const LOCALE = "es-CR";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
};

/** "14:35" from an ISO timestamp — used for a unit's return time. */
export const formatShortTime = (isoTimestamp: string): string =>
  new Intl.DateTimeFormat(LOCALE, TIME_FORMAT).format(new Date(isoTimestamp));

/** "29/08/2026" from an ISO timestamp — used by the history table. */
export const formatShortDate = (isoTimestamp: string): string =>
  new Intl.DateTimeFormat(LOCALE, DATE_FORMAT).format(new Date(isoTimestamp));
