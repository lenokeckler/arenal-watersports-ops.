import { STRING, TO_LOCALE_OPTIONS } from "@/app/constants";

export const formatDate = (
  dateStr: string | null,
  locale: string
): string => {
  if (!dateStr) {
    return STRING.Empty;
  }
  const [day, month, year] = dateStr.split("/");
  const date = new Date(+year, +month - 1, +day);
  if (isNaN(date.getTime())) {
    return STRING.Empty;
  }
  return date
    .toLocaleDateString(locale, TO_LOCALE_OPTIONS)
    .replace(/^[a-záéíóú]/i, (firstLetter) =>
      firstLetter.toUpperCase()
    );
};
