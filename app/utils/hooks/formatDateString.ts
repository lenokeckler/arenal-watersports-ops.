import { STRING, DATE } from "@/app/constants";

export const formatDateString = (
  dateString: string,
  toFormat:
    typeof DATE.YEAR_MONTH_DAY | typeof DATE.DAY_MONTH_YEAR
): string => {
  if (!dateString) {
    return STRING.Empty;
  }

  if (toFormat === DATE.DAY_MONTH_YEAR) {
    const [year, month, day] = dateString.split(
      STRING.DASH
    );
    return `${day}${STRING.SLASH}${month}${STRING.SLASH}${year}`;
  }

  const [day, month, year] = dateString.split(STRING.SLASH);
  return `${year}${STRING.DASH}${month}${STRING.DASH}${day}`;
};
