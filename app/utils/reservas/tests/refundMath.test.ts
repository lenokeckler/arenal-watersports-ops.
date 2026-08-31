import { describe, expect, it } from "vitest";
import {
  refundableAmount,
  refundAmountForPercentage,
} from "../refundMath";
import { validateRefundForm } from "../reservationMoneyValidation";
import type {
  ChargeRecord,
  RefundRecord,
} from "../reservationMovementRecords";

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

const refund = (
  amount: number,
  currency: "USD" | "CRC",
  percentage: number
): RefundRecord => ({
  amount,
  createdAt: "2026-08-31T11:00:00Z",
  createdByName: "Leno",
  currency,
  id: `r-${amount}-${currency}`,
  percentage,
  reason: "Lluvia",
});

describe("refund never leaves the net negative", () => {
  it("caps at what is still charged in that currency", () => {
    const charges = [
      charge(120, "USD"),
      charge(60000, "CRC"),
    ];
    const refunds = [refund(60, "USD", 50)];
    expect(refundableAmount(charges, refunds, "USD")).toBe(
      60
    );
    expect(refundableAmount(charges, refunds, "CRC")).toBe(
      60000
    );
  });

  it("rejects a percentage that would return more than is left", () => {
    const charges = [charge(120, "USD")];
    const refunds = [refund(60, "USD", 50)];
    const errors = validateRefundForm({
      computedAmount: refundAmountForPercentage(
        100,
        charges,
        "USD"
      ),
      percentage: 100,
      reason: "Cancelación",
      refundableAmount: refundableAmount(
        charges,
        refunds,
        "USD"
      ),
    });
    expect(errors.percentage).toBeDefined();
  });

  it("lets two refunds of 50% return exactly the whole charge", () => {
    const charges = [charge(120, "USD")];
    expect(
      refundAmountForPercentage(50, charges, "USD")
    ).toBe(60);
    const errors = validateRefundForm({
      computedAmount: 60,
      percentage: 50,
      reason: "Cancelación",
      refundableAmount: refundableAmount(
        charges,
        [refund(60, "USD", 50)],
        "USD"
      ),
    });
    expect(errors).toEqual({});
  });

  it("rejects a refund when nothing was charged in that currency", () => {
    const errors = validateRefundForm({
      computedAmount: 0,
      percentage: 50,
      reason: "Cancelación",
      refundableAmount: refundableAmount(
        [charge(120, "USD")],
        [],
        "CRC"
      ),
    });
    expect(errors.percentage).toBeDefined();
  });
});
