import { describe, expect, it } from "vitest";
import {
  clampFreeToInUse,
  sumQuantityByCategory,
} from "../dispatchedQuantity";

describe("sumQuantityByCategory", () => {
  it("sums the dispatched quantity of a single category", () => {
    const totals = sumQuantityByCategory([
      { category_id: "kayak-individual", quantity: 3 },
    ]);

    expect(totals.get("kayak-individual")).toBe(3);
  });

  it("adds up several dispatched reservation items in the same category", () => {
    const totals = sumQuantityByCategory([
      { category_id: "kayak-individual", quantity: 2 },
      { category_id: "kayak-individual", quantity: 1 },
    ]);

    expect(totals.get("kayak-individual")).toBe(3);
  });

  it("keeps categories separate", () => {
    const totals = sumQuantityByCategory([
      { category_id: "kayak-individual", quantity: 3 },
      { category_id: "paddleboard", quantity: 2 },
    ]);

    expect(totals.get("kayak-individual")).toBe(3);
    expect(totals.get("paddleboard")).toBe(2);
  });

  it("treats a missing quantity as zero instead of dropping the row", () => {
    const totals = sumQuantityByCategory([
      { category_id: "kayak-individual", quantity: null },
    ]);

    expect(totals.get("kayak-individual")).toBe(0);
  });

  it("skips a row with no category id", () => {
    const totals = sumQuantityByCategory([
      { category_id: null, quantity: 5 },
    ]);

    expect(totals.size).toBe(0);
  });

  it("returns an empty map for no dispatched items", () => {
    const totals = sumQuantityByCategory([]);

    expect(totals.size).toBe(0);
  });
});

describe("clampFreeToInUse", () => {
  it("reads zero free when every unit is dispatched past its franja", () => {
    // Reported bug: 3 kayaks in stock, all 3 dispatched at 18:00-19:00 and
    // still not closed at 22:03. `category_availability`'s window-based
    // `free` no longer sees the overlap and reports 3 free — this is the
    // fix that reconciles it against `inUse` for the board card.
    expect(clampFreeToInUse(3, 3, 3)).toBe(0);
  });

  it("leaves free untouched when it already agrees with inUse", () => {
    expect(clampFreeToInUse(6, 3, 9)).toBe(6);
  });

  it("clamps free down when the window under-counts a partial dispatch", () => {
    expect(clampFreeToInUse(8, 3, 9)).toBe(6);
  });

  it("never returns a negative free count", () => {
    expect(clampFreeToInUse(2, 5, 3)).toBe(0);
  });

  it("keeps free as-is when nothing is dispatched", () => {
    expect(clampFreeToInUse(9, 0, 9)).toBe(9);
  });

  it("reads zero Disponibles on QuantityTiles when the whole usable stock is dispatched", () => {
    // Same reported bug, one screen down: `/tablero/categoria/<kayak
    // individual>` showed "3 Disponibles" and "3 En uso ahora" for a stock
    // of 3 — `categoryQuantityDetail.ts` calls `clampFreeToInUse` with
    // `free === total === usable` (there is no separate windowed `free`
    // here, just the raw usable count), so this is the same reconciliation
    // applied to a plain subtraction.
    expect(clampFreeToInUse(3, 3, 3)).toBe(0);
  });
});
