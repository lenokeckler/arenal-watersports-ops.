/**
 * Numeric domain values for EP-RES-07 (cobros, descuentos y depósitos).
 * Every amount the screens write lands in a `numeric(_,2)` column, so
 * every computed figure is rounded to `AMOUNT_DECIMALS` before it is sent.
 */
export const MONEY_NUMBERS = {
  /** `numeric(14,2)` everywhere money is stored. */
  AMOUNT_DECIMALS: 2,
  /** `reservation_charges.amount` and `refunds.amount` are `check (amount > 0)`. */
  MIN_AMOUNT: 0.01,
  /** `refunds.percentage` is `check (percentage > 0 and percentage <= 100)`. */
  MIN_REFUND_PERCENTAGE: 0.01,
  MAX_REFUND_PERCENTAGE: 100,
  /** A line without an explicit quantity commits exactly one piece of equipment. */
  SINGLE_UNIT_QUANTITY: 1,
  /** How many days back the revenue chart on `/reservas/ingresos` covers. */
  REVENUE_TREND_WINDOW_DAYS: 14,
} as const;
