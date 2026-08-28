import { STRING } from "@/app/constants";

const ZERO_HOUR = 0;
const ZERO_MINUTES = 0;
const ZERO_SECONDS = 0;
const ZERO_MILLISECONDS = 0;

const LAST_HOUR = 23;
const LAST_MINUTES = 59;
const LAST_SECONDS = 59;
const LAST_MILLISECONDS = 999;
const ZERO_INDEXED_MONTH_OFFSET = 1;

export const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString
    .split(STRING.DASH)
    .map(Number);

  const localStart = new Date(
    year,
    month - ZERO_INDEXED_MONTH_OFFSET,
    day,
    ZERO_HOUR,
    ZERO_MINUTES,
    ZERO_SECONDS,
    ZERO_MILLISECONDS
  );

  const localEnd = new Date(
    year,
    month - ZERO_INDEXED_MONTH_OFFSET,
    day,
    LAST_HOUR,
    LAST_MINUTES,
    LAST_SECONDS,
    LAST_MILLISECONDS
  );

  const startDate = localStart.toISOString();
  const endDate = localEnd.toISOString();

  return { startDate, endDate };
};
