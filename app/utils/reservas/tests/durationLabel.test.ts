import { describe, expect, it } from "vitest";
import { formatDurationLabel } from "../durationLabel";

describe("formatDurationLabel", () => {
  it("reads a preset duration by its own shortcut label", () => {
    expect(formatDurationLabel(30)).toBe("30m");
    expect(formatDurationLabel(60)).toBe("1h");
    expect(formatDurationLabel(90)).toBe("1.5h");
    expect(formatDurationLabel(120)).toBe("2h");
    expect(formatDurationLabel(180)).toBe("3h");
  });

  it("reads a whole-hour custom duration without minutes", () => {
    expect(formatDurationLabel(240)).toBe("4h");
  });

  it("reads a sub-hour custom duration in minutes only", () => {
    expect(formatDurationLabel(45)).toBe("45m");
  });

  it("reads a mixed custom duration as hours and minutes, not raw minutes", () => {
    expect(formatDurationLabel(100)).toBe("1h 40m");
  });

  it("returns an empty string for a non-positive or invalid duration", () => {
    expect(formatDurationLabel(0)).toBe("");
    expect(formatDurationLabel(-15)).toBe("");
    expect(formatDurationLabel(Number.NaN)).toBe("");
  });
});
