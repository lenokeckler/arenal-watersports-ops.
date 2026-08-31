import { TIME } from "@/app/constants";
import type { Nullable } from "@/app/types";

const ISO_DATE_LENGTH = 10;
const HOURS_IN_DAY = 24;
const MILLISECONDS_IN_DAY =
  HOURS_IN_DAY *
  TIME.UNITS.MINUTES_IN_HOUR *
  TIME.UNITS.SECONDS_IN_MINUTE *
  TIME.UNITS.MILLISECONDS_IN_SECOND;
const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * UTC "today", matching the `at time zone 'UTC'` convention every report
 * view uses (`20260828001500_reports.sql`). Shared by
 * `/administracion/reportes` (US-ADM-026) and `/reservas/ingresos`
 * (US-RES-032) so both screens agree on which day is "hoy".
 */
export const toUtcIsoDay = (date: Date): string =>
  date.toISOString().slice(0, ISO_DATE_LENGTH);

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * MILLISECONDS_IN_DAY);

/**
 * The day a revenue screen should show: whatever came in the query
 * string, but only when it really is an ISO day — anything else falls
 * back to today instead of reaching the database as a filter it cannot
 * parse.
 */
export const resolveRevenueDay = (
  requestedDay: Nullable<string>,
  fallbackDay: string
): string =>
  requestedDay && ISO_DAY_PATTERN.test(requestedDay)
    ? requestedDay
    : fallbackDay;
