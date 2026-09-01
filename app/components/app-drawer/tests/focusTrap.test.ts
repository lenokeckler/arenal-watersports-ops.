import { describe, expect, it } from "vitest";
import { resolveTabFocusTarget } from "../utils/focusTrap";

describe("resolveTabFocusTarget", () => {
  const firstElement = document.createElement("button");
  const middleElement = document.createElement("button");
  const lastElement = document.createElement("button");
  const focusableElements = [
    firstElement,
    middleElement,
    lastElement,
  ];

  it("wraps focus to the last element on shift+tab from the first", () => {
    expect(
      resolveTabFocusTarget(
        focusableElements,
        firstElement,
        true
      )
    ).toBe(lastElement);
  });

  it("wraps focus to the first element on tab from the last", () => {
    expect(
      resolveTabFocusTarget(
        focusableElements,
        lastElement,
        false
      )
    ).toBe(firstElement);
  });

  it("does not redirect focus away from an element in the middle", () => {
    expect(
      resolveTabFocusTarget(
        focusableElements,
        middleElement,
        false
      )
    ).toBeNull();
  });

  it("does nothing when the panel has no focusable elements", () => {
    expect(
      resolveTabFocusTarget([], null, false)
    ).toBeNull();
  });
});
