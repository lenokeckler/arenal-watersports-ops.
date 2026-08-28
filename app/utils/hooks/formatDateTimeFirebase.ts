import { STRING, DATE } from "@/app/constants";

const PAD_LENGTH = 2;
const MONTH_OFFSET = 1;

export const formatDateTimeFirebase = (
  value: string | null,
  format:
    | typeof DATE.YEAR_MONTH_DAY
    | typeof DATE.DAY_MONTH_YEAR = DATE.YEAR_MONTH_DAY
): string => {
  if (!value) {
    return STRING.Empty;
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return STRING.Empty;
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + MONTH_OFFSET
  ).padStart(PAD_LENGTH, STRING.ZERO);
  const day = String(date.getDate()).padStart(
    PAD_LENGTH,
    STRING.ZERO
  );

  const hours = String(date.getHours()).padStart(
    PAD_LENGTH,
    STRING.ZERO
  );
  const minutes = String(date.getMinutes()).padStart(
    PAD_LENGTH,
    STRING.ZERO
  );

  const time = `${hours}${STRING.COLON}${minutes}`;

  if (format === DATE.DAY_MONTH_YEAR) {
    return `${day}${STRING.SLASH}${month}${STRING.SLASH}${year} ${time}`;
  }

  return `${year}${STRING.DASH}${month}${STRING.DASH}${day} ${time}`;
};
