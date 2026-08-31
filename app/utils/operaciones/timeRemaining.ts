import { TIME } from "@/app/constants";

const MILLISECONDS_IN_MINUTE =
  TIME.UNITS.SECONDS_IN_MINUTE *
  TIME.UNITS.MILLISECONDS_IN_SECOND;

export interface TimeRemaining {
  /** Always >= 0 — minutes left if not overdue, minutes past due if it is. */
  minutes: number;
  isOverdue: boolean;
}

/**
 * US-OPE-004/US-OPE-005: how long until a dispatched unit is due back, or
 * how far past that it already is. `referenceTime` is injected instead of
 * read from `Date.now()` here so the board's ticking clock (and this
 * function's tests) both control it explicitly.
 */
export const computeTimeRemaining = (
  endsAt: string,
  referenceTime: number
): TimeRemaining => {
  const diffMinutes = Math.round(
    (new Date(endsAt).getTime() - referenceTime) /
      MILLISECONDS_IN_MINUTE
  );

  return diffMinutes >= 0
    ? { isOverdue: false, minutes: diffMinutes }
    : { isOverdue: true, minutes: Math.abs(diffMinutes) };
};
