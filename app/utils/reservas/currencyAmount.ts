import {
  CURRENCY_CODE,
  MONEY_NUMBERS,
  type CurrencyCode,
} from "@/app/constants";
import type { Nullable, NullableRef } from "@/app/types";

const NO_AMOUNT = 0;

/**
 * The same figure expressed in each currency the system handles. The two
 * halves are never added together: there is no exchange rate anywhere in
 * this project (US-RES-025), so a `null` here means "no price in this
 * currency", never "zero".
 */
export interface CurrencyAmounts {
  crc: Nullable<number>;
  usd: Nullable<number>;
}

/** Every money column is `numeric(_, 2)`; nothing is written unrounded. */
export const roundAmount = (value: number): number =>
  Number(value.toFixed(MONEY_NUMBERS.AMOUNT_DECIMALS));

/** Picks the half of a two-currency price that matches `currency`. */
export const pickCurrencyAmount = (
  currency: CurrencyCode,
  amounts: CurrencyAmounts
): NullableRef<number> =>
  (currency === CURRENCY_CODE.USD
    ? amounts.usd
    : amounts.crc) ?? null;

/** Builds a `CurrencyAmounts` from a per-currency resolver. */
export const byCurrency = (
  resolve: (currency: CurrencyCode) => NullableRef<number>
): CurrencyAmounts => ({
  crc: resolve(CURRENCY_CODE.CRC),
  usd: resolve(CURRENCY_CODE.USD),
});

/** Adds up the movements of one currency. Currencies are never mixed. */
export const sumByCurrency = (
  movements: readonly {
    amount: number;
    currency: CurrencyCode;
  }[],
  currency: CurrencyCode
): number =>
  movements
    .filter((movement) => movement.currency === currency)
    .reduce(
      (total, movement) => total + movement.amount,
      NO_AMOUNT
    );
