import { Nullable } from "@/app/types";

export const hasPriceFilter = (
  minValue: Nullable<number>,
  maxValue: Nullable<number>
): boolean =>
  (minValue !== undefined && minValue !== null) ||
  (maxValue !== undefined && maxValue !== null);
