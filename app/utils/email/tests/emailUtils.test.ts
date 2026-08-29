import { describe, expect, it } from "vitest";
import { isValidEmailFormat } from "../emailUtils";

describe("isValidEmailFormat", () => {
  it("accepts a plausible personal email", () => {
    expect(isValidEmailFormat("trabajador@gmail.com")).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(isValidEmailFormat("")).toBe(false);
  });

  it("rejects a value with no @", () => {
    expect(isValidEmailFormat("trabajador.gmail.com")).toBe(false);
  });

  it("rejects a value with no domain dot", () => {
    expect(isValidEmailFormat("trabajador@gmail")).toBe(false);
  });

  it("rejects a value with spaces", () => {
    expect(isValidEmailFormat("trabajador @gmail.com")).toBe(
      false
    );
  });

  it("tolerates surrounding whitespace from a pasted value", () => {
    expect(isValidEmailFormat("  trabajador@gmail.com  ")).toBe(
      true
    );
  });
});
