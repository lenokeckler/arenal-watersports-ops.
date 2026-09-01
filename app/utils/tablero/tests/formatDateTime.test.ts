import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import {
  formatShortDate,
  formatShortTime,
} from "../formatDateTime";

/**
 * Regression test for the bug that showed a 9 a. m. Costa Rica reservation
 * as "3:00 p. m.": nothing here pinned a time zone, so `Intl.DateTimeFormat`
 * fell back to the environment's own zone. On a developer's machine in
 * Costa Rica that hid the bug; Vercel's Node runtime is UTC, so production
 * rendered every date and time six hours off. Setting `process.env.TZ` to
 * `"UTC"` reproduces that production environment inside the test, so this
 * fails again the moment someone formats a date or time without
 * `TIME.CR.TIME_ZONE`.
 */
describe("formatShortTime / formatShortDate (UTC server runtime)", () => {
  const ORIGINAL_TZ = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it("shows the Costa Rica hour, not the server's UTC hour", () => {
    // 09:00 Costa Rica (UTC-6) on 2026-08-02 is 15:00 UTC.
    const bookedAtNineAmCostaRica = "2026-08-02T15:00:00Z";

    expect(formatShortTime(bookedAtNineAmCostaRica)).toBe(
      "09:00 a. m."
    );
  });

  it("shows the Costa Rica calendar day, not the server's UTC day", () => {
    // 2026-08-03T02:00:00Z is already August 3rd in UTC, but it is still
    // August 2nd, 8:00 p. m. in Costa Rica.
    const stillAugustSecondInCostaRica =
      "2026-08-03T02:00:00Z";

    expect(
      formatShortDate(stillAugustSecondInCostaRica)
    ).toBe("02/08/2026");
  });
});
