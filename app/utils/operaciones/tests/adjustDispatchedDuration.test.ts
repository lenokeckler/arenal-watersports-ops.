import { describe, expect, it } from "vitest";
import { computeExtendedMinutes } from "../adjustDispatchedDuration";

describe("computeExtendedMinutes", () => {
  it("counts the minutes added when the duration grows", () => {
    expect(computeExtendedMinutes(60, 90)).toBe(30);
  });

  it("stays at zero when the duration shrinks", () => {
    expect(computeExtendedMinutes(90, 60)).toBe(0);
  });

  it("stays at zero when the duration does not change", () => {
    expect(computeExtendedMinutes(60, 60)).toBe(0);
  });
});
