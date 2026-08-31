import { describe, expect, it } from "vitest";
import { isWithinWorkday } from "../workday";

/**
 * Costa Rica is UTC-6 with no daylight saving, so a UTC hour maps to a
 * Costa Rica hour by a fixed 6-hour subtraction. Building dates from a UTC
 * ISO string keeps these tests independent of the machine's local timezone.
 */
const utcDate = (isoDateTime: string): Date =>
  new Date(isoDateTime);

describe("isWithinWorkday", () => {
  it("is true right at the start of the workday, 7:00 a. m. Costa Rica", () => {
    expect(isWithinWorkday(utcDate("2026-08-28T13:00:00Z"))).toBe(
      true
    );
  });

  it("is true in the middle of the workday", () => {
    expect(isWithinWorkday(utcDate("2026-08-28T18:00:00Z"))).toBe(
      true
    );
  });

  it("is false exactly at 7:00 p. m. Costa Rica, when off-hours begins", () => {
    expect(isWithinWorkday(utcDate("2026-08-29T01:00:00Z"))).toBe(
      false
    );
  });

  it("is true one minute before 7:00 p. m. Costa Rica", () => {
    expect(isWithinWorkday(utcDate("2026-08-29T00:59:00Z"))).toBe(
      true
    );
  });

  it("is false right before the workday starts, 6:59 a. m. Costa Rica", () => {
    expect(isWithinWorkday(utcDate("2026-08-28T12:59:00Z"))).toBe(
      false
    );
  });

  it("is false in the middle of the night", () => {
    expect(isWithinWorkday(utcDate("2026-08-28T08:00:00Z"))).toBe(
      false
    );
  });
});
