import { describe, expect, it } from "vitest";
import { WORK_AREA } from "@/app/constants";
import { hasReservationsModeAccess } from "../access";

/**
 * US-ACC-011: reservas-flavored screens (the calendar's "Nueva reserva",
 * a reservation's money figures, registering an external guide) must
 * follow the active mode, not merely whether the account also holds the
 * reservas area.
 */
describe("hasReservationsModeAccess", () => {
  it("grants access while the active mode is reservas", () => {
    expect(
      hasReservationsModeAccess(WORK_AREA.RESERVATIONS)
    ).toBe(true);
  });

  it("grants access while the active mode is administración", () => {
    expect(
      hasReservationsModeAccess(WORK_AREA.ADMINISTRATION)
    ).toBe(true);
  });

  it("denies access while the active mode is operaciones, even for an account that also holds reservas", () => {
    expect(
      hasReservationsModeAccess(WORK_AREA.OPERATIONS)
    ).toBe(false);
  });

  it("denies access when no mode could be resolved", () => {
    expect(hasReservationsModeAccess(null)).toBe(false);
  });
});
