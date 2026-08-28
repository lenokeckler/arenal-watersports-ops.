import { STRING } from "@/app/constants";

const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const FIRST_DAY_OF_MONTH = 1;
const DAY_BEFORE_FIRST_OF_NEXT_MONTH = 0;

export const daysUntilEndOfMonth = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const lastDayOfMonth = new Date(
    year,
    month + FIRST_DAY_OF_MONTH,
    DAY_BEFORE_FIRST_OF_NEXT_MONTH
  );

  const diffTime =
    lastDayOfMonth.getTime() - today.getTime();

  const diffDays = Math.ceil(
    diffTime /
      (MS_IN_SECOND *
        SECONDS_IN_MINUTE *
        MINUTES_IN_HOUR *
        HOURS_IN_DAY)
  );

  return `${diffDays} ${STRING.D_LETTER}`;
};
