import type { JSX } from "react";
import { formatAmount } from "@/app/utils/money/formatAmount";
import {
  CURRENCY_CODE,
  CURRENCY_LABEL,
  MONEY_LABEL,
  type CurrencyCode,
} from "@/app/constants";
import type { PriceAmountsProps } from "./models/PriceAmountsProps.interface";

interface Amount {
  currency: CurrencyCode;
  value: number;
}

const NO_AMOUNTS = 0;

/**
 * US-TAB-010 / US-ADM-026: amounts are shown per currency and never
 * summed — there is no exchange rate anywhere in this system. Shared by
 * `/precios` and every administración catalog that carries a price (extras,
 * combos, tarifas).
 */
const PriceAmounts = ({
  amountCrc,
  amountUsd,
}: PriceAmountsProps): JSX.Element => {
  const amounts: Amount[] = [];
  if (amountUsd !== null && amountUsd !== undefined) {
    amounts.push({
      currency: CURRENCY_CODE.USD,
      value: amountUsd,
    });
  }
  if (amountCrc !== null && amountCrc !== undefined) {
    amounts.push({
      currency: CURRENCY_CODE.CRC,
      value: amountCrc,
    });
  }

  if (amounts.length === NO_AMOUNTS) {
    return (
      <span className="text-on-surface-variant/60">
        {MONEY_LABEL.NO_PRICE}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-0.5 font-label-mono text-label-mono">
      {amounts.map((amount) => (
        <span
          key={amount.currency}
          className="text-primary"
        >
          {CURRENCY_LABEL[amount.currency]}
          {formatAmount(amount.value)}
        </span>
      ))}
    </span>
  );
};

export default PriceAmounts;
