import { describe, expect, it } from "vitest";
import { checkPasswordValidity } from "../passwordUtils";

describe("checkPasswordValidity", () => {
  it("flags every rule as unmet for an empty password", () => {
    expect(checkPasswordValidity("")).toEqual({
      isLengthValid: false,
      isLowerValid: false,
      isNumberValid: false,
      isSymbolValid: false,
      isUpperValid: false,
    });
  });

  it("accepts a password that meets every rule", () => {
    expect(checkPasswordValidity("Arenal.2026")).toEqual({
      isLengthValid: true,
      isLowerValid: true,
      isNumberValid: true,
      isSymbolValid: true,
      isUpperValid: true,
    });
  });

  it("rejects a password shorter than the 8-character minimum", () => {
    expect(checkPasswordValidity("Ab1.").isLengthValid).toBe(false);
  });

  it("accepts a password exactly at the 72-character maximum", () => {
    const password = "Aa1.".repeat(18);

    expect(password).toHaveLength(72);
    expect(checkPasswordValidity(password).isLengthValid).toBe(true);
  });

  it("rejects a password one character past the 72-character maximum", () => {
    const password = `${"Aa1.".repeat(18)}A`;

    expect(password).toHaveLength(73);
    expect(checkPasswordValidity(password).isLengthValid).toBe(false);
  });

  it("requires at least one lowercase letter", () => {
    expect(checkPasswordValidity("ARENAL.2026").isLowerValid).toBe(
      false
    );
  });

  it("requires at least one uppercase letter", () => {
    expect(checkPasswordValidity("arenal.2026").isUpperValid).toBe(
      false
    );
  });

  it("requires at least one number", () => {
    expect(
      checkPasswordValidity("Arenal.Water").isNumberValid
    ).toBe(false);
  });

  it("requires at least one symbol", () => {
    expect(checkPasswordValidity("Arenal2026").isSymbolValid).toBe(
      false
    );
  });
});
