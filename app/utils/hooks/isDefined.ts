import { Nullable } from "@/app/types";

export const isDefined = <T>(
  value: Nullable<T> | undefined
): value is T => value !== undefined && value !== null;
