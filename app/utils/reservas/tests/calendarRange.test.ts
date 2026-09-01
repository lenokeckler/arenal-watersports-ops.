import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";
import { CALENDAR_VIEW } from "@/app/constants";
import {
  parseDateOnlyParam,
  resolveCalendarRange,
  toDateOnlyParam,
} from "../calendarRange";

/**
 * Regression test for the day-window half of the timezone bug:
 * `/operaciones/despacho` and `/reservas/calendario` resolve "today" on
 * the server, and Vercel's Node runtime is UTC in production. Between
 * 6 p. m. and midnight Costa Rica time, the UTC calendar day has already
 * rolled over to tomorrow — so without a Costa Rica-anchored `startOfDay`,
 * the dispatch board stopped showing today's reservations and started
 * showing tomorrow's. `process.env.TZ = "UTC"` reproduces that production
 * runtime inside the test.
 */
describe("resolveCalendarRange (UTC server runtime)", () => {
  const ORIGINAL_TZ = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it("keeps today's day window in Costa Rica even after Costa Rica evening rolls the UTC day forward", () => {
    // 2026-08-03T01:00:00Z is already August 3rd in UTC, but it is still
    // August 2nd, 7:00 p. m. in Costa Rica — the exact window the dock
    // stopped seeing today's reservations in.
    const sevenPmCostaRicaOnAugustSecond = new Date(
      "2026-08-03T01:00:00Z"
    );

    const range = resolveCalendarRange(
      CALENDAR_VIEW.DAY,
      sevenPmCostaRicaOnAugustSecond
    );

    expect(range.startsAt.toISOString()).toBe(
      "2026-08-02T06:00:00.000Z"
    );
    expect(range.endsAt.toISOString()).toBe(
      "2026-08-03T06:00:00.000Z"
    );
  });

  it("does not roll today's window forward just before Costa Rica midnight", () => {
    // 2026-08-03T05:59:00Z is 11:59 p. m. in Costa Rica on August 2nd.
    const oneMinuteBeforeCostaRicaMidnight = new Date(
      "2026-08-03T05:59:00Z"
    );

    const range = resolveCalendarRange(
      CALENDAR_VIEW.DAY,
      oneMinuteBeforeCostaRicaMidnight
    );

    expect(range.startsAt.toISOString()).toBe(
      "2026-08-02T06:00:00.000Z"
    );
  });
});

describe("toDateOnlyParam / parseDateOnlyParam (UTC server runtime)", () => {
  const ORIGINAL_TZ = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = "UTC";
  });

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it("reads the Costa Rica calendar day out of an instant, not the UTC day", () => {
    const sevenPmCostaRicaOnAugustSecond = new Date(
      "2026-08-03T01:00:00Z"
    );

    expect(
      toDateOnlyParam(sevenPmCostaRicaOnAugustSecond)
    ).toBe("2026-08-02");
  });

  it("round-trips a ?date= param back to that same Costa Rica day's window", () => {
    const referenceDate = parseDateOnlyParam("2026-08-02");

    const range = resolveCalendarRange(
      CALENDAR_VIEW.DAY,
      referenceDate
    );

    expect(range.startsAt.toISOString()).toBe(
      "2026-08-02T06:00:00.000Z"
    );
  });
});
