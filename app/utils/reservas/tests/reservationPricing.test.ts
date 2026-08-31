import { describe, expect, it } from "vitest";
import {
  hasAnyAmount,
  toReservationPricing,
  type ReservationPricingRow,
} from "../reservationPricing";

const row = (
  overrides: Partial<ReservationPricingRow> = {}
): ReservationPricingRow => ({
  agreed_amount_crc: null,
  agreed_amount_usd: null,
  list_amount_crc: null,
  list_amount_usd: null,
  ...overrides,
});

describe("a reservation with no price row is not a failed query", () => {
  it("reads a missing row as four empty amounts", () => {
    expect(toReservationPricing(null)).toEqual({
      agreedAmountCrc: null,
      agreedAmountUsd: null,
      listAmountCrc: null,
      listAmountUsd: null,
    });
  });

  it("reads the same emptiness whether nobody priced it or the reader is denied it", () => {
    expect(toReservationPricing(undefined)).toEqual(
      toReservationPricing(null)
    );
  });

  it("carries every amount across when the row is there", () => {
    expect(
      toReservationPricing(
        row({
          agreed_amount_usd: 400,
          list_amount_crc: 240000,
          list_amount_usd: 480,
        })
      )
    ).toEqual({
      agreedAmountCrc: null,
      agreedAmountUsd: 400,
      listAmountCrc: 240000,
      listAmountUsd: 480,
    });
  });
});

describe("only a reservation with an amount earns a price row", () => {
  it("skips the row when every amount is empty", () => {
    expect(hasAnyAmount(toReservationPricing(null))).toBe(
      false
    );
  });

  it("writes the row when a single amount is set", () => {
    expect(
      hasAnyAmount(
        toReservationPricing(
          row({ agreed_amount_crc: 200000 })
        )
      )
    ).toBe(true);
  });

  it("treats a zero as a real amount, not as absence", () => {
    expect(
      hasAnyAmount(
        toReservationPricing(row({ list_amount_usd: 0 }))
      )
    ).toBe(true);
  });
});
