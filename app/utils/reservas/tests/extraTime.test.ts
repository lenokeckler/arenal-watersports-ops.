import { describe, expect, it } from "vitest";
import { extraTimeMinutes } from "../extraTime";

describe("extra time", () => {
  const endsAt = "2026-08-31T12:00:00Z";
  const twoHoursLater = new Date(
    "2026-08-31T14:00:00Z"
  ).getTime();

  it("counts the minutes past the hour of a dispatched outing", () => {
    expect(
      extraTimeMinutes({
        closedAt: null,
        endsAt,
        extendedMinutes: 0,
        referenceTime: twoHoursLater,
        status: "dispatched",
      })
    ).toBe(120);
  });

  it("adds what operaciones extended to what ran over", () => {
    expect(
      extraTimeMinutes({
        closedAt: "2026-08-31T12:30:00Z",
        endsAt,
        extendedMinutes: 15,
        referenceTime: twoHoursLater,
        status: "closed",
      })
    ).toBe(45);
  });

  it("never goes negative when the equipment came back early", () => {
    expect(
      extraTimeMinutes({
        closedAt: "2026-08-31T11:00:00Z",
        endsAt,
        extendedMinutes: 0,
        referenceTime: twoHoursLater,
        status: "closed",
      })
    ).toBe(0);
  });

  it("ignores the clock for a reservation that never went out", () => {
    expect(
      extraTimeMinutes({
        closedAt: null,
        endsAt,
        extendedMinutes: 0,
        referenceTime: twoHoursLater,
        status: "scheduled",
      })
    ).toBe(0);
  });
});
