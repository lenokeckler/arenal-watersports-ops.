import { TIME, WORKDAY_HOURS } from "@/app/constants";

const COSTA_RICA_OFFSET_MS =
  TIME.CR.HOURS_OFFSET *
  TIME.UNITS.MINUTES_IN_HOUR *
  TIME.UNITS.SECONDS_IN_MINUTE *
  TIME.UNITS.MILLISECONDS_IN_SECOND;

/**
 * Whether `referenceDate` falls inside the field workday (US-ACC-009,
 * US-ACC-010): 7:00 a. m. to 7:00 p. m., Costa Rica time. Must always be
 * called with a server-generated `Date` — never one built from a value the
 * client sent — because the whole point of this check is that the device
 * clock cannot decide it (section 5 of the access module design).
 */
export const isWithinWorkday = (referenceDate: Date): boolean => {
  const costaRicaDate = new Date(
    referenceDate.getTime() - COSTA_RICA_OFFSET_MS
  );
  const costaRicaHour = costaRicaDate.getUTCHours();

  return (
    costaRicaHour >= WORKDAY_HOURS.START_HOUR &&
    costaRicaHour < WORKDAY_HOURS.END_HOUR
  );
};
