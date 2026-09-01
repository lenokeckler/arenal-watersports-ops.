import { describe, expect, it } from "vitest";
import { WORK_AREA } from "@/app/constants";
import { resolveActiveWorkArea } from "../workAreas";

describe("resolveActiveWorkArea", () => {
  it("returns the stored mode when it is still one of the enabled areas", () => {
    expect(
      resolveActiveWorkArea({
        areas: [
          WORK_AREA.RESERVATIONS,
          WORK_AREA.OPERATIONS,
        ],
        lastWorkArea: WORK_AREA.OPERATIONS,
      })
    ).toBe(WORK_AREA.OPERATIONS);
  });

  it("falls back to the only remaining area when the stored mode was revoked and one area is left (US-ACC-011: a mode never grants more than the areas allow)", () => {
    expect(
      resolveActiveWorkArea({
        areas: [WORK_AREA.OPERATIONS],
        lastWorkArea: WORK_AREA.RESERVATIONS,
      })
    ).toBe(WORK_AREA.OPERATIONS);
  });

  it("returns null when the stored mode was revoked and more than one area is still enabled", () => {
    expect(
      resolveActiveWorkArea({
        areas: [
          WORK_AREA.OPERATIONS,
          WORK_AREA.ADMINISTRATION,
        ],
        lastWorkArea: WORK_AREA.RESERVATIONS,
      })
    ).toBeNull();
  });

  it("resolves the only area a worker holds even without a stored mode", () => {
    expect(
      resolveActiveWorkArea({
        areas: [WORK_AREA.ADMINISTRATION],
        lastWorkArea: null,
      })
    ).toBe(WORK_AREA.ADMINISTRATION);
  });

  it("returns null when more than one area is enabled and no mode was ever chosen", () => {
    expect(
      resolveActiveWorkArea({
        areas: [
          WORK_AREA.RESERVATIONS,
          WORK_AREA.OPERATIONS,
        ],
        lastWorkArea: null,
      })
    ).toBeNull();
  });
});
