import type { JSX } from "react";
import {
  CURRENCY_LABEL,
  RESERVATIONS_REVENUE_SCREEN,
} from "@/app/constants";
import type { DailyRevenueRow } from "@/app/utils/administracion/reports";

interface RevenueCurrencyCardProps {
  row: DailyRevenueRow;
}

const AmountLine = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => (
  <span className="flex justify-between font-body-base text-body-base text-on-surface-variant">
    {label}
    <span>{value}</span>
  </span>
);

/**
 * US-RES-032: one card per currency, exactly as `daily_revenue_report`
 * returns it. There is no card that adds the two together, because there
 * is no exchange rate to add them with (US-RES-025).
 */
const RevenueCurrencyCard = ({
  row,
}: RevenueCurrencyCardProps): JSX.Element => (
  <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface-container-low p-sm">
    <span className="font-title-md text-title-md text-primary">
      {CURRENCY_LABEL[row.currency]}
      {row.currency}
    </span>
    <AmountLine
      label={RESERVATIONS_REVENUE_SCREEN.GROSS_LABEL}
      value={row.grossAmount.toFixed(2)}
    />
    <AmountLine
      label={RESERVATIONS_REVENUE_SCREEN.REFUNDS_LABEL}
      value={`-${row.refundsAmount.toFixed(2)}`}
    />
    <AmountLine
      label={RESERVATIONS_REVENUE_SCREEN.RETAINED_LABEL}
      value={`+${row.retainedAmount.toFixed(2)}`}
    />
    <span className="flex justify-between border-t border-white/10 pt-1 font-title-md text-title-md text-on-surface">
      {RESERVATIONS_REVENUE_SCREEN.NET_LABEL}
      <span>{row.netAmount.toFixed(2)}</span>
    </span>
  </div>
);

export default RevenueCurrencyCard;
