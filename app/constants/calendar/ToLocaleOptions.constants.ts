import { TIME } from "../strings/Date.constants";

export const TO_LOCALE_OPTIONS: Intl.DateTimeFormatOptions =
  {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TIME.CR.TIME_ZONE,
  } as const;
