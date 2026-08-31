import { describe, expect, it } from "vitest";
import { proposeTariffAmounts } from "../reservationMoneyProposals";
import { proposeDepositAmounts } from "../depositProposal";

describe("proposals", () => {
  const lines = [
    {
      categoryId: "jet",
      extraPriceCrc: null,
      extraPriceUsd: null,
      quantity: 1,
    },
    {
      categoryId: "jet",
      extraPriceCrc: null,
      extraPriceUsd: null,
      quantity: 1,
    },
  ];
  const tariffs = [
    {
      amountCrc: 60000,
      amountUsd: 120,
      categoryId: "jet",
      type: "rental" as const,
    },
  ];

  it("multiplies the tariff by the duration", () => {
    expect(
      proposeTariffAmounts({
        durationMinutes: 120,
        lines,
        tariffs,
        type: "rental",
      })
    ).toEqual({ crc: 240000, usd: 480 });
  });

  it("returns null for a currency the catalog has no price in", () => {
    expect(
      proposeTariffAmounts({
        durationMinutes: 60,
        lines,
        tariffs: [
          {
            amountCrc: null,
            amountUsd: 120,
            categoryId: "jet",
            type: "rental",
          },
        ],
        type: "rental",
      })
    ).toEqual({ crc: null, usd: 240 });
  });

  it("adds an extra's flat price on top of the hourly tariff", () => {
    expect(
      proposeTariffAmounts({
        durationMinutes: 60,
        lines: [
          {
            categoryId: "jet",
            extraPriceCrc: null,
            extraPriceUsd: 25,
            quantity: 1,
          },
        ],
        tariffs: [
          {
            amountCrc: null,
            amountUsd: 120,
            categoryId: "jet",
            type: "rental",
          },
        ],
        type: "rental",
      }).usd
    ).toBe(145);
  });

  it("sums the deposit of every category going out", () => {
    expect(
      proposeDepositAmounts({
        categoryDeposits: [
          {
            categoryId: "jet",
            depositCrc: 100000,
            depositUsd: 200,
          },
        ],
        lines,
      })
    ).toEqual({ crc: 200000, usd: 400 });
  });

  it("proposes nothing for a category without a deposit", () => {
    expect(
      proposeDepositAmounts({
        categoryDeposits: [
          {
            categoryId: "kayak",
            depositCrc: null,
            depositUsd: null,
          },
        ],
        lines: [
          {
            categoryId: "kayak",
            extraPriceCrc: null,
            extraPriceUsd: null,
            quantity: 3,
          },
        ],
      })
    ).toEqual({ crc: null, usd: null });
  });
});
