import { Nullable } from "@/app/types";
import { STRING } from "@/app/constants";

export const isTextFilterActive = (
  value: Nullable<string> | undefined
): value is string =>
  value !== undefined &&
  value !== null &&
  value.trim() !== STRING.Empty;
