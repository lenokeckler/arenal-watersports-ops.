import type { JSX } from "react";
import {
  CURRENCY_CODE,
  CURRENCY_LABEL,
  PRICE_LIST_SCREEN,
  type CurrencyCode,
} from "@/app/constants";

interface PriceAmountsProps {
  amountCrc: number | null;
  amountUsd: number | null;
}

interface Amount {
  currency: CurrencyCode;
  value: number;
}

const NO_AMOUNTS = 0;

/**
 * US-TAB-010 / US-ADM-026: amounts are shown per currency and never
 * summed — there is no exchange rate anywhere in this system.
 */
const PriceAmounts = ({ amountCrc, amountUsd }: PriceAmountsProps): JSX.Element => {
  const amounts: Amount[] = [];
  if (amountUsd !== null) {
    amounts.push({ currency: CURRENCY_CODE.USD, value: amountUsd });
  }
  if (amountCrc !== null) {
    amounts.push({ currency: CURRENCY_CODE.CRC, value: amountCrc });
  }

  if (amounts.length === NO_AMOUNTS) {
    return (
      <span className="text-on-surface-variant/60">
        {PRICE_LIST_SCREEN.NO_PRICE}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-0.5 font-label-mono text-label-mono">
      {amounts.map((amount) => (
        <span key={amount.currency} className="text-primary">
          {CURRENCY_LABEL[amount.currency]}
          {amount.value.toFixed(2)}
        </span>
      ))}
    </span>
  );
};

export default PriceAmounts;
