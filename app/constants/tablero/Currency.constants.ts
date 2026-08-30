/**
 * Mirrors the database's `currency_code` enum. Amounts are always shown
 * per currency and never summed (US-TAB-010, US-ADM-026): the system does
 * not manage an exchange rate.
 */
export const CURRENCY_CODE = {
  CRC: "CRC",
  USD: "USD",
} as const;

export type CurrencyCode =
  (typeof CURRENCY_CODE)[keyof typeof CURRENCY_CODE];

export const CURRENCY_LABEL = {
  [CURRENCY_CODE.CRC]: "₡",
  [CURRENCY_CODE.USD]: "$",
} as const satisfies Record<CurrencyCode, string>;
