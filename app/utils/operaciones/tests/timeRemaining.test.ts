import { describe, expect, it } from "vitest";
import { computeTimeRemaining } from "../timeRemaining";

describe("computeTimeRemaining", () => {
  const endsAt = "2026-08-31T12:00:00Z";

  it("counts down the minutes still left before the return time", () => {
    const thirtyMinutesBefore = new Date(
      "2026-08-31T11:30:00Z"
    ).getTime();

    expect(
      computeTimeRemaining(endsAt, thirtyMinutesBefore)
    ).toEqual({ isOverdue: false, minutes: 30 });
  });

  it("flags overdue once the return time has passed", () => {
    const fifteenMinutesAfter = new Date(
      "2026-08-31T12:15:00Z"
    ).getTime();

    expect(
      computeTimeRemaining(endsAt, fifteenMinutesAfter)
    ).toEqual({ isOverdue: true, minutes: 15 });
  });

  it("reads exactly the return time as not overdue yet", () => {
    const exactReturnTime = new Date(endsAt).getTime();

    expect(
      computeTimeRemaining(endsAt, exactReturnTime)
    ).toEqual({ isOverdue: false, minutes: 0 });
  });
});
