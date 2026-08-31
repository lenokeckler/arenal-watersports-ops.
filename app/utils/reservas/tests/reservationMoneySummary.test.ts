import { describe, expect, it } from "vitest";
import { summarizeReservationMoney } from "../reservationMoneySummary";
import type { ChargeRecord } from "../reservationMovementRecords";

const charge = (
  amount: number,
  currency: "USD" | "CRC",
  kind: "tariff" | "extra_time" = "tariff"
): ChargeRecord => ({
  amount,
  createdAt: "2026-08-31T10:00:00Z",
  createdByName: "Leno",
  currency,
  id: `${amount}-${currency}-${kind}`,
  kind,
  paymentMethod: "Efectivo",
});

describe("currencies are never mixed", () => {
  it("keeps two currencies as two rows", () => {
    const rows = summarizeReservationMoney({
      agreedAmounts: { crc: null, usd: null },
      charges: [charge(120, "USD"), charge(60000, "CRC")],
      listAmounts: { crc: 240000, usd: 480 },
      refunds: [],
    });
    expect(rows.map((row) => row.currency)).toEqual([
      "CRC",
      "USD",
    ]);
    expect(
      rows.find((row) => row.currency === "USD")
        ?.pendingAmount
    ).toBe(360);
    expect(
      rows.find((row) => row.currency === "CRC")
        ?.pendingAmount
    ).toBe(180000);
  });

  it("never lets pending go below zero when more was charged than agreed", () => {
    const [row] = summarizeReservationMoney({
      agreedAmounts: { crc: null, usd: 100 },
      charges: [charge(150, "USD")],
      listAmounts: { crc: null, usd: 100 },
      refunds: [],
    });
    expect(row.pendingAmount).toBe(0);
  });

  it("keeps extra time out of the pending figure", () => {
    const [row] = summarizeReservationMoney({
      agreedAmounts: { crc: null, usd: 480 },
      charges: [
        charge(120, "USD"),
        charge(30, "USD", "extra_time"),
      ],
      listAmounts: { crc: null, usd: 480 },
      refunds: [],
    });
    expect(row.pendingAmount).toBe(360);
    expect(row.netAmount).toBe(150);
  });
});
