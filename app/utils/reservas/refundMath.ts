import {
  MONEY_NUMBERS,
  type CurrencyCode,
} from "@/app/constants";
import type {
  ChargeRecord,
  RefundRecord,
} from "./reservationMovementRecords";
import {
  roundAmount,
  sumByCurrency,
} from "./currencyAmount";

const NOTHING = 0;

/**
 * US-RES-028: how much can still be given back in one currency before the
 * reservation's net income would turn negative. The database only checks
 * that a refund is positive, so this ceiling is the one thing standing
 * between a mistyped percentage and a reservation that reports less than
 * zero in the day's revenue.
 */
export const refundableAmount = (
  charges: ChargeRecord[],
  refunds: RefundRecord[],
  currency: CurrencyCode
): number =>
  roundAmount(
    Math.max(
      sumByCurrency(charges, currency) -
        sumByCurrency(refunds, currency),
      NOTHING
    )
  );

/**
 * US-RES-028: "se indica el porcentaje devuelto" — the percentage always
 * applies to everything charged in that currency, not to what is left
 * after an earlier refund, so two refunds of 50% return exactly the whole
 * charge and never more.
 */
export const refundAmountForPercentage = (
  percentage: number,
  charges: ChargeRecord[],
  currency: CurrencyCode
): number =>
  roundAmount(
    (percentage * sumByCurrency(charges, currency)) /
      MONEY_NUMBERS.MAX_REFUND_PERCENTAGE
  );
