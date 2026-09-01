import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  CALENDAR_VIEW,
  CALENDAR_VIEW_STORAGE_KEY,
} from "@/app/constants";
import {
  buildCalendarViewRedirectScript,
  getStoredCalendarView,
  persistCalendarView,
} from "../calendarViewStorage";

describe("getStoredCalendarView", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredCalendarView()).toBeNull();
  });

  it("returns the stored view when it is a valid value", () => {
    window.localStorage.setItem(
      CALENDAR_VIEW_STORAGE_KEY,
      CALENDAR_VIEW.MONTH
    );

    expect(getStoredCalendarView()).toBe(
      CALENDAR_VIEW.MONTH
    );
  });

  it("returns null for a corrupted value", () => {
    window.localStorage.setItem(
      CALENDAR_VIEW_STORAGE_KEY,
      "not-a-real-view"
    );

    expect(getStoredCalendarView()).toBeNull();
  });

  it("returns null when localStorage throws", () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });

    expect(getStoredCalendarView()).toBeNull();

    getItemSpy.mockRestore();
  });
});

describe("persistCalendarView", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("saves the view under the device-only storage key", () => {
    persistCalendarView(CALENDAR_VIEW.DAY);

    expect(
      window.localStorage.getItem(CALENDAR_VIEW_STORAGE_KEY)
    ).toBe(CALENDAR_VIEW.DAY);
  });

  it("does not throw when localStorage write fails", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });

    expect(() =>
      persistCalendarView(CALENDAR_VIEW.DAY)
    ).not.toThrow();

    setItemSpy.mockRestore();
  });
});

/**
 * US-RES-001: "lo pongo en día y cambio de pantalla y vuelvo al calendario
 * y dice semana" — the script this builds is what makes the device's
 * last-used view win over the server-rendered default when the URL did
 * not already name a view.
 */
describe("buildCalendarViewRedirectScript", () => {
  it("embeds the storage key, the current view and the allowed views", () => {
    const script = buildCalendarViewRedirectScript(
      CALENDAR_VIEW.WEEK,
      [CALENDAR_VIEW.DAY, CALENDAR_VIEW.WEEK]
    );

    expect(script).toContain(CALENDAR_VIEW_STORAGE_KEY);
    expect(script).toContain(CALENDAR_VIEW.WEEK);
    expect(script).toContain(CALENDAR_VIEW.DAY);
  });

  it("wraps the body in a try/catch so a disabled localStorage cannot break the page", () => {
    const script = buildCalendarViewRedirectScript(
      CALENDAR_VIEW.DAY,
      [CALENDAR_VIEW.DAY]
    );

    expect(script).toMatch(/^\(function\(\)\{try\{/);
    expect(script).toContain("catch(e){}");
  });
});
