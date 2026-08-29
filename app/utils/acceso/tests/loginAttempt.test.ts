import { describe, expect, it } from "vitest";
import { evaluateLoginAttempt } from "../loginAttempt";

describe("evaluateLoginAttempt", () => {
  it("does not block a regular account under the limit", () => {
    expect(
      evaluateLoginAttempt({
        failedAttempts: 9,
        isAdministrationAccount: false,
      })
    ).toEqual({ isBlocked: false, recoveryAvailable: false });
  });

  it("blocks a regular account exactly at the tenth failed attempt", () => {
    expect(
      evaluateLoginAttempt({
        failedAttempts: 10,
        isAdministrationAccount: false,
      })
    ).toEqual({ isBlocked: true, recoveryAvailable: false });
  });

  it("keeps blocking a regular account past the tenth attempt", () => {
    expect(
      evaluateLoginAttempt({
        failedAttempts: 11,
        isAdministrationAccount: false,
      })
    ).toEqual({ isBlocked: true, recoveryAvailable: false });
  });

  it("never blocks the administration account at the limit, offers recovery instead", () => {
    expect(
      evaluateLoginAttempt({
        failedAttempts: 10,
        isAdministrationAccount: true,
      })
    ).toEqual({ isBlocked: false, recoveryAvailable: true });
  });

  it("does not offer recovery for the administration account under the limit", () => {
    expect(
      evaluateLoginAttempt({
        failedAttempts: 3,
        isAdministrationAccount: true,
      })
    ).toEqual({ isBlocked: false, recoveryAvailable: false });
  });
});
