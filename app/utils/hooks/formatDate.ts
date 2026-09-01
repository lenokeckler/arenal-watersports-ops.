import {
  STRING,
  TIME,
  TO_LOCALE_OPTIONS,
} from "@/app/constants";

export const formatDate = (
  dateStr: string | null,
  locale: string
): string => {
  if (!dateStr) {
    return STRING.Empty;
  }
  const [day, month, year] = dateStr.split("/");
  // Anchored to Costa Rica midnight (`Date.UTC` plus the fixed CR hour
  // offset) rather than `new Date(year, month, day)`, which reads the
  // parts as the *runtime's* local midnight — UTC in production — and
  // would hand `TO_LOCALE_OPTIONS`'s explicit Costa Rica zone the wrong
  // instant, shifting the date back a day.
  const date = new Date(
    Date.UTC(+year, +month - 1, +day, TIME.CR.HOURS_OFFSET)
  );
  if (isNaN(date.getTime())) {
    return STRING.Empty;
  }
  return date
    .toLocaleDateString(locale, TO_LOCALE_OPTIONS)
    .replace(/^[a-záéíóú]/i, (firstLetter) =>
      firstLetter.toUpperCase()
    );
};
