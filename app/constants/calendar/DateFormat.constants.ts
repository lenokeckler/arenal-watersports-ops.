import { TIME } from "../strings/Date.constants";

export const DATE_FORMAT = {
  LOCALE: "es-ES",
} as const;

// Pinned to the company's own zone (§ TIME.CR.TIME_ZONE) — never the
// environment's, which resolving via `Intl.DateTimeFormat().resolvedOptions()`
// used to do. On Vercel that environment is UTC, so this used to render
// reservations six hours off from what was actually booked.
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions =
  {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME.CR.TIME_ZONE,
  } as const;
