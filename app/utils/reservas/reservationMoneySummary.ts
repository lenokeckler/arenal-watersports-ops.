import {
  CHARGE_KIND,
  CURRENCY_CODE,
  type CurrencyCode,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
import type {
  ChargeRecord,
  RefundRecord,
} from "./reservationMovementRecords";
import {
  pickCurrencyAmount,
  roundAmount,
  sumByCurrency,
  type CurrencyAmounts,
} from "./currencyAmount";

const NOTHING = 0;

export interface CurrencySummaryRow {
  agreedAmount: NullableRef<number>;
  chargedExtraTime: number;
  chargedTariff: number;
  currency: CurrencyCode;
  listAmount: NullableRef<number>;
  netAmount: number;
  /** `null` when nothing was agreed in this currency: there is nothing to be short of. */
  pendingAmount: NullableRef<number>;
  refundedAmount: number;
}

export interface ReservationMoneySummaryParams {
  agreedAmounts: CurrencyAmounts;
  charges: ChargeRecord[];
  listAmounts: CurrencyAmounts;
  refunds: RefundRecord[];
}

const buildRow = (
  currency: CurrencyCode,
  {
    agreedAmounts,
    charges,
    listAmounts,
    refunds,
  }: ReservationMoneySummaryParams
): CurrencySummaryRow => {
  const chargedTariff = sumByCurrency(
    charges.filter(
      (charge) => charge.kind === CHARGE_KIND.TARIFF
    ),
    currency
  );
  const chargedExtraTime = sumByCurrency(
    charges.filter(
      (charge) => charge.kind === CHARGE_KIND.EXTRA_TIME
    ),
    currency
  );
  const refundedAmount = sumByCurrency(refunds, currency);
  const agreedAmount =
    pickCurrencyAmount(currency, agreedAmounts) ??
    pickCurrencyAmount(currency, listAmounts);

  return {
    agreedAmount,
    chargedExtraTime: roundAmount(chargedExtraTime),
    chargedTariff: roundAmount(chargedTariff),
    currency,
    listAmount: pickCurrencyAmount(currency, listAmounts),
    netAmount: roundAmount(
      chargedTariff + chargedExtraTime - refundedAmount
    ),
    pendingAmount:
      agreedAmount === null
        ? null
        : roundAmount(
            Math.max(agreedAmount - chargedTariff, NOTHING)
          ),
    refundedAmount: roundAmount(refundedAmount),
  };
};

const hasSomethingToSay = (
  row: CurrencySummaryRow
): boolean =>
  row.agreedAmount !== null ||
  row.chargedTariff > NOTHING ||
  row.chargedExtraTime > NOTHING ||
  row.refundedAmount > NOTHING;

/**
 * US-RES-025/US-RES-026: what was agreed, what has been charged and what
 * is still missing, one row per currency and never a single merged total.
 * The pending figure is measured against the tariff only — extra time is
 * "aparte de la tarifa" (US-RES-031) — and against what was agreed *in
 * that same currency*, because the system converts nothing.
 */
export const summarizeReservationMoney = (
  params: ReservationMoneySummaryParams
): CurrencySummaryRow[] =>
  Object.values(CURRENCY_CODE)
    .map((currency) => buildRow(currency, params))
    .filter(hasSomethingToSay);
